import type { StandardSchemaV1 } from './types.ts'

import { SchemaValidator } from '../SchemaValidator.ts'
import { ValidationError } from '../ValidationError.ts'
import { parsePathString } from './pathConverter.ts'
import { registerSchemaValidateCallback } from './attachStandardSchema.ts'

registerSchemaValidateCallback((value: unknown, guard): StandardSchemaV1.Result<any> => {
    const [err, val] = SchemaValidator.validate(value, guard, false)

    if (err) {
        const issues: StandardSchemaV1.Issue[] = []

        for (const error of err.errors) {
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

    return { success: true, value: val }
})
