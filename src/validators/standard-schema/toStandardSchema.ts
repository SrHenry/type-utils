import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { StandardSchemaV1 } from './types.ts'

export function toStandardSchema<T>(guard: TypeGuard<T>): StandardSchemaV1<T, T> {
  if ('~standard' in (guard as object)) {
    return { '~standard': (guard as any)['~standard'] }
  }

  return {
    '~standard': {
      version: 1,
      vendor: '@srhenry/type-utils',
      validate: (value: unknown): StandardSchemaV1.Result<T> => {
        if (guard(value)) {
          return { success: true, value: value as T }
        }

        return {
          success: false,
          issues: [{ message: `Value does not match type guard` }],
        }
      },
    },
  }
}
