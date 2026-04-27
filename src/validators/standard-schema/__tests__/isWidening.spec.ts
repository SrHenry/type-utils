import { is } from '../../../TypeGuards/helpers/is.ts'
import { string } from '../../schema/string.ts'
import type { StandardSchemaV1 } from '../types.ts'

describe('is() with Standard Schema', () => {
  it('should accept TypeGuard as before', () => {
    expect(is('hello', string())).toBe(true)
    expect(is(42, string())).toBe(false)
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

    expect(is('hello', externalSchema)).toBe(true)
    expect(is(42, externalSchema)).toBe(false)
  })
})
