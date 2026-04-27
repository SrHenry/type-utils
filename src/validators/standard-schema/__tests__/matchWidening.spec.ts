import { match } from '../../../match/match.ts'
import { string } from '../../schema/string.ts'
import type { StandardSchemaV1 } from '../types.ts'

describe('match() with Standard Schema', () => {
  it('should match using TypeGuard as before', () => {
    const m = match('hello')
      .with(string(), v => `string: ${v}`)
      .default('other')

    expect((m as any).exec()).toBe('string: hello')
  })

  it('should match using StandardSchemaV1 at runtime', () => {
    const stringSchema: StandardSchemaV1<string> = {
      '~standard': {
        version: 1,
        vendor: 'test-lib',
        validate: (value: unknown) => {
          if (typeof value === 'string') return { success: true as const, value }
          return { success: false as const, issues: [{ message: 'Expected string' }] }
        },
      },
    }

    const numberSchema: StandardSchemaV1<number> = {
      '~standard': {
        version: 1,
        vendor: 'test-lib',
        validate: (value: unknown) => {
          if (typeof value === 'number') return { success: true as const, value }
          return { success: false as const, issues: [{ message: 'Expected number' }] }
        },
      },
    }

    const m = match('hello' as string | number)
      .with(numberSchema as any, (v: number) => `number: ${v}`)
      .with(stringSchema as any, (v: string) => `string: ${v}`)
      .default('other')

    expect((m as any).exec()).toBe('string: hello')
  })

  it('should throw TypeError for async Standard Schema in match', () => {
    const asyncSchema: StandardSchemaV1<string> = {
      '~standard': {
        version: 1,
        vendor: 'async-lib',
        validate: () => Promise.resolve({ success: true as const, value: 'hello' }),
      },
    }

    const m = match('hello')
      .with(asyncSchema as any, (v: string) => v)
      .default('fallback')

    expect(() => (m as any).exec()).toThrow(TypeError)
  })
})
