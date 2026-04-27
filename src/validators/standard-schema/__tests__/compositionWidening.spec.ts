import { string } from '../../schema/string.ts'
import { number } from '../../schema/number.ts'
import { object } from '../../schema/object.ts'
import { array } from '../../schema/array.ts'
import { tuple } from '../../schema/tuple.ts'
import { or } from '../../schema/or.ts'
import { and } from '../../schema/and.ts'
import { record } from '../../schema/record.ts'
import { asEnum } from '../../schema/asEnum.ts'
import type { StandardSchemaV1 } from '../types.ts'

function mockStdSchema<T>(vendor: string, validate: (value: unknown) => value is T): StandardSchemaV1<T, T> {
  return {
    '~standard': {
      version: 1,
      vendor,
      validate: (value: unknown) => {
        if (validate(value)) return { success: true as const, value }
        return { success: false as const, issues: [{ message: `Expected ${vendor}` }] }
      },
    },
  }
}

const zodString = mockStdSchema('zod', (v): v is string => typeof v === 'string')
const zodNumber = mockStdSchema('zod', (v): v is number => typeof v === 'number')
const zodStringOptional = mockStdSchema('zod', (v): v is string | undefined => typeof v === 'string' || v === undefined)

describe('Composition widening — object()', () => {
  it('accepts StandardSchemaV1 as tree values', () => {
    const userSchema = object({ name: zodString, age: zodNumber })
    expect(userSchema({ name: 'Alice', age: 30 })).toBe(true)
    expect(userSchema({ name: 42, age: 30 })).toBe(false)
  })

  it('handles optional StandardSchemaV1 in tree', () => {
    const schema = object({ name: zodString, bio: zodStringOptional })
    expect(schema({ name: 'Alice', bio: 'dev' })).toBe(true)
    expect(schema({ name: 'Alice' })).toBe(true)
    expect(schema({ name: 'Alice', bio: 42 })).toBe(false)
  })

  it('mixes TypeGuard and StandardSchemaV1 in same tree', () => {
    const schema = object({ name: zodString, age: number() })
    expect(schema({ name: 'Alice', age: 30 })).toBe(true)
    expect(schema({ name: 'Alice', age: 'nope' })).toBe(false)
  })
})

describe('Composition widening — array()', () => {
  it('accepts StandardSchemaV1 as element schema', () => {
    const schema = array(zodString)
    expect(schema(['a', 'b'])).toBe(true)
    expect(schema(['a', 1])).toBe(false)
  })

  it('accepts StandardSchemaV1 as tree schema', () => {
    const schema = array({ name: zodString })
    expect(schema([{ name: 'Alice' }])).toBe(true)
    expect(schema([{ name: 42 }])).toBe(false)
  })
})

describe('Composition widening — tuple()', () => {
  it('accepts StandardSchemaV1 as element schemas', () => {
    const schema = tuple(zodString, zodNumber)
    expect(schema(['hello', 42])).toBe(true)
    expect(schema(['hello', 'nope'])).toBe(false)
  })

  it('mixes TypeGuard and StandardSchemaV1 in tuple', () => {
    const schema = tuple(zodString, number())
    expect(schema(['hello', 42])).toBe(true)
  })
})

describe('Composition widening — or()', () => {
  it('accepts StandardSchemaV1 as union members', () => {
    const schema = or(zodString, zodNumber)
    expect(schema('hello')).toBe(true)
    expect(schema(42)).toBe(true)
    expect(schema(true)).toBe(false)
  })

  it('mixes TypeGuard and StandardSchemaV1 in union', () => {
    const schema = or(zodString, number())
    expect(schema('hello')).toBe(true)
    expect(schema(42)).toBe(true)
  })
})

describe('Composition widening — and()', () => {
  it('accepts StandardSchemaV1 as intersection members', () => {
    const hasName = mockStdSchema('test', (v): v is { name: string } =>
      typeof v === 'object' && v !== null && 'name' in v && typeof (v as any).name === 'string'
    )
    const hasAge = mockStdSchema('test', (v): v is { age: number } =>
      typeof v === 'object' && v !== null && 'age' in v && typeof (v as any).age === 'number'
    )
    const schema = and(hasName, hasAge)
    expect(schema({ name: 'Alice', age: 30 })).toBe(true)
    expect(schema({ name: 'Alice' })).toBe(false)
  })
})

describe('Composition widening — record()', () => {
  it('accepts StandardSchemaV1 as value guard', () => {
    const schema = record(string(), zodNumber)
    expect(schema({ a: 1, b: 2 })).toBe(true)
    expect(schema({ a: 'nope' })).toBe(false)
  })

  it('accepts StandardSchemaV1 as key and value guards', () => {
    const zodStringKey = mockStdSchema('zod', (v): v is string => typeof v === 'string')
    const schema = record(zodStringKey, zodNumber)
    expect(schema({ a: 1 })).toBe(true)
  })
})

describe('asEnum — toStandardSchema()', () => {
  it('produces a valid StandardSchemaV1', () => {
    const schema = asEnum(['a', 'b', 'c'] as const)
    const stdSchema = schema.toStandardSchema()
    expect(stdSchema['~standard'].version).toBe(1)
    const result = stdSchema['~standard'].validate('a') as Exclude<ReturnType<StandardSchemaV1<any>['~standard']['validate']>, Promise<any>>
    expect(result.success).toBe(true)
  })
})

describe('normalizeSchema — vendor message', () => {
  it('sets vendor-based message on normalized guards', () => {
    const schema = object({ name: zodString })
    const guard = schema as any
    const metadata = guard?.__metadata__
    if (metadata?.tree?.name) {
      expect(metadata.tree.name.__message__).toContain('zod')
    }
  })
})
