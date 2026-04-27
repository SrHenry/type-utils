import { string } from '../../schema/string.ts'
import { object } from '../../schema/object.ts'
import { isStandardSchema } from '../isStandardSchema.ts'
import { fromStandardSchema } from '../fromStandardSchema.ts'
import { toStandardSchema } from '../toStandardSchema.ts'
import type { StandardSchemaV1, StandardSchemaV1 as SS } from '../types.ts'

describe('producer: ~standard auto-attached on schemas', () => {
  it('should attach ~standard property to string schema', () => {
    const guard = string()
    expect('~standard' in guard).toBe(true)
  })

  it('should not be detected as isStandardSchema (it is a function, not a plain object)', () => {
    const guard = string()
    expect(isStandardSchema(guard)).toBe(false)
  })

  it('should make ~standard non-enumerable', () => {
    const guard = string()
    const descriptor = Object.getOwnPropertyDescriptor(guard, '~standard')
    expect(descriptor?.enumerable).toBe(false)
  })

  it('should report correct vendor and version', () => {
    const guard = string()
    const props = (guard as unknown as StandardSchemaV1<string>)['~standard']
    expect(props.version).toBe(1)
    expect(props.vendor).toBe('@srhenry/type-utils')
  })
})

describe('producer: ~standard.validate', () => {
  it('should return success result for valid input', () => {
    const guard = string()
    const result = (guard as unknown as StandardSchemaV1<string>)['~standard'].validate('hello') as SS.Result<string>
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value).toBe('hello')
    }
  })

  it('should return failure result for invalid input', () => {
    const guard = string()
    const result = (guard as unknown as StandardSchemaV1<string>)['~standard'].validate(42) as SS.Result<string>
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0]!.message).toBeDefined()
    }
  })

  it('should return failure with path info for nested object validation', () => {
    const guard = object({ name: string().min(1) })
    const result = (guard as unknown as StandardSchemaV1)['~standard'].validate({ name: '' }) as SS.Result
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0)
    }
  })

  it('should return success for fluent schema with rules', () => {
    const guard = string().min(3)
    const result = (guard as unknown as StandardSchemaV1<string>)['~standard'].validate('abc') as SS.Result<string>
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value).toBe('abc')
    }
  })

  it('should return failure for fluent schema with rules violated', () => {
    const guard = string().min(3)
    const result = (guard as unknown as StandardSchemaV1<string>)['~standard'].validate('ab') as SS.Result<string>
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0)
    }
  })
})

describe('producer: .toStandardSchema()', () => {
  it('should return a clean StandardSchemaV1 object from string schema', () => {
    const guard = string()
    const std = guard.toStandardSchema()
    expect(std['~standard']).toBeDefined()
    expect(std['~standard'].version).toBe(1)
    expect(std['~standard'].vendor).toBe('@srhenry/type-utils')
  })

  it('should validate correctly via toStandardSchema', () => {
    const std = string().toStandardSchema()
    const valid = std['~standard'].validate('hello') as SS.Result<string>
    const invalid = std['~standard'].validate(42) as SS.Result<string>
    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it('should return a pure Standard Schema object without TypeGuard methods', () => {
    const std = string().toStandardSchema()
    expect(typeof std).toBe('object')
    expect(typeof (std as any).__call).toBe('undefined')
  })
})

describe('consumer: fromStandardSchema', () => {
  it('should wrap a Standard Schema into a TypeGuard', () => {
    const externalSchema: StandardSchemaV1<string> = {
      '~standard': {
        version: 1,
        vendor: 'test-lib',
        validate: (value: unknown): SS.Result<string> => {
          if (typeof value === 'string') return { success: true as const, value }
          return {
            success: false as const,
            issues: [{ message: 'Expected string' }],
          }
        },
      },
    }

    const guard = fromStandardSchema(externalSchema)
    expect(guard('hello')).toBe(true)
    expect(guard(42)).toBe(false)
  })

  it('should throw TypeError for async schemas', () => {
    const asyncSchema: StandardSchemaV1<string> = {
      '~standard': {
        version: 1,
        vendor: 'async-lib',
        validate: () => Promise.resolve({ success: true as const, value: 'hello' }),
      },
    }

    const guard = fromStandardSchema(asyncSchema)
    expect(() => guard('hello')).toThrow(TypeError)
    expect(() => guard('hello')).toThrow('async')
  })
})

describe('producer: toStandardSchema adapter for plain TypeGuards', () => {
  it('should work for plain TypeGuard without struct metadata', () => {
    const guard = (value: unknown): value is string => typeof value === 'string'
    const std = toStandardSchema(guard)
    const valid = std['~standard'].validate('hello') as SS.Result<string>
    const invalid = std['~standard'].validate(42) as SS.Result<string>
    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})
