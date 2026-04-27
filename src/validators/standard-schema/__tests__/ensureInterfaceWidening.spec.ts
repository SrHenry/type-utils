import { ensureInterface } from '../../../TypeGuards/helpers/ensureInterface.ts'
import { string } from '../../schema/string.ts'
import type { StandardSchemaV1 } from '../types.ts'

describe('ensureInterface() with Standard Schema', () => {
  it('should accept TypeGuard as before', () => {
    expect(ensureInterface('hello', string())).toBe('hello')
  })

  it('should throw for invalid value with TypeGuard as before', () => {
    expect(() => ensureInterface(42, string())).toThrow()
  })

  it('should accept StandardSchemaV1 plain object directly', () => {
    const externalSchema: StandardSchemaV1<string> = {
      '~standard': {
        version: 1,
        vendor: 'test-lib',
        validate: (value: unknown) => {
          if (typeof value === 'string') return { success: true as const, value }
          return { success: false as const, issues: [{ message: 'Expected string' }] }
        },
      },
    }

    expect(ensureInterface('hello', externalSchema)).toBe('hello')
    expect(() => ensureInterface(42, externalSchema)).toThrow()
  })

  it('should support curried form with StandardSchemaV1', () => {
    const externalSchema: StandardSchemaV1<string> = {
      '~standard': {
        version: 1,
        vendor: 'test-lib',
        validate: (value: unknown) => {
          if (typeof value === 'string') return { success: true as const, value }
          return { success: false as const, issues: [{ message: 'Expected string' }] }
        },
      },
    }

    const ensureString = ensureInterface(externalSchema)
    expect(typeof ensureString).toBe('function')
    expect(ensureString('hello')).toBe('hello')
    expect(() => ensureString(42)).toThrow()
  })
})
