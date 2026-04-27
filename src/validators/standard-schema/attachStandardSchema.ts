import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { StandardSchemaV1 } from './types.ts'

import { SchemaValidator } from '../SchemaValidator.ts'
import { ValidationErrors } from '../ValidationErrors.ts'
import { ValidationError } from '../ValidationError.ts'
import { parsePathString } from './pathConverter.ts'

export function attachStandardSchema<T>(guard: TypeGuard<T>): void {
  if ('~standard' in (guard as object)) return

  const standardProps: StandardSchemaV1.Props<T, T> = {
    version: 1,
    vendor: '@srhenry/type-utils',
    validate: (value: unknown): StandardSchemaV1.Result<T> => {
      const result = SchemaValidator.validate(value, guard, false)

      if (result instanceof ValidationErrors) {
        const issues: StandardSchemaV1.Issue[] = []

        for (const error of result.errors) {
          if (error instanceof ValidationError) {
            issues.push({
              message: error.message,
              path: parsePathString(error.path),
            })
          } else {
            issues.push({
              message: String(error),
            })
          }
        }

        return { success: false, issues }
      }

      return { success: true, value: result as T }
    },
    types: {
      input: undefined as unknown as T,
      output: undefined as unknown as T,
    },
  }

  Object.defineProperty(guard, '~standard', {
    value: standardProps,
    writable: false,
    enumerable: false,
    configurable: false,
  })
}
