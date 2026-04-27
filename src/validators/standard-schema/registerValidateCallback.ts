import type { StandardSchemaV1 } from './types.ts'

import { SchemaValidator } from '../SchemaValidator.ts'
import { ValidationErrors } from '../ValidationErrors.ts'
import { ValidationError } from '../ValidationError.ts'
import { parsePathString } from './pathConverter.ts'
import { registerSchemaValidateCallback } from './attachStandardSchema.ts'

registerSchemaValidateCallback(
  (value: unknown, guard, shouldThrow): StandardSchemaV1.Result<any> => {
    const result = SchemaValidator.validate(value, guard, shouldThrow)

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

    return { success: true, value: result }
  }
)
