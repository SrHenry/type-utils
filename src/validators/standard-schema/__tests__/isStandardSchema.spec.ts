import { isStandardSchema } from '../isStandardSchema.ts'
import type { StandardSchemaV1 } from '../types.ts'

describe('isStandardSchema', () => {
  it('should return true for a valid Standard Schema object', () => {
    const schema: StandardSchemaV1<string> = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: () => ({ success: true, value: 'hello' }),
      },
    }
    expect(isStandardSchema(schema)).toBe(true)
  })

  it('should return false for null', () => {
    expect(isStandardSchema(null)).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isStandardSchema(undefined)).toBe(false)
  })

  it('should return false for a function', () => {
    expect(isStandardSchema(() => true)).toBe(false)
  })

  it('should return false for a TypeGuard function even with ~standard', () => {
    const guard = (value: unknown): value is string => typeof value === 'string'
    Object.defineProperty(guard, '~standard', {
      value: { version: 1, vendor: 'test', validate: () => ({ success: true, value: 'hello' }) },
      enumerable: false,
    })
    expect(isStandardSchema(guard)).toBe(false)
  })

  it('should return false for an object without ~standard', () => {
    expect(isStandardSchema({ foo: 'bar' })).toBe(false)
  })

  it('should return false for an object with ~standard but no validate', () => {
    expect(isStandardSchema({ '~standard': { version: 1, vendor: 'test' } })).toBe(false)
  })

  it('should return false for a primitive value', () => {
    expect(isStandardSchema(42)).toBe(false)
    expect(isStandardSchema('hello')).toBe(false)
  })
})
