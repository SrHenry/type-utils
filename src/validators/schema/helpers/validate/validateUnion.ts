import type { Result } from '../../../../types/Result.ts'
import type { V3 } from '../../types/index.ts'
import type { ValidationContext, ValidateFn } from './ValidationContext.ts'

import { validateRules } from '../../../RuleValidator.ts'
import { updateStructMetadata } from '../updateStructMetadata.ts'
import type { ValidationErrors } from '../../../ValidationErrors.ts'
import { isOptionalCheck } from './helpers/isOptionalCheck.ts'

export function validateUnion(ctx: ValidationContext, validate: ValidateFn): void {
    const metadata = ctx.metadata as V3.UnionStruct<any[]>

    if (isOptionalCheck(metadata, ctx.arg)) return

    const unionResults = metadata.types.map(({ schema, rules: unionInnerRule }) =>
        validate(
            ctx.arg,
            updateStructMetadata(schema, {
                rules: unionInnerRule as any,
            }),
            {
                name: ctx.name,
                parent: ctx.parent,
            }
        )
    )

    const unionRulesResults = validateRules(
        ctx.arg,
        metadata.rules as any,
        ctx.schema,
        ctx.name,
        ctx.parent
    )

    ctx.errors.push(...unionRulesResults)

    const unionErrors = unionResults.filter(
        (r): r is [ValidationErrors, null] => (r as Result<unknown, ValidationErrors>)[0] !== null
    )

    if (unionErrors.length === unionResults.length) {
        const unionErrorList = unionErrors.flatMap(([err]) => Array.from(err))

        ctx.pushNewError({
            message: 'Value does not match any of the union types',
            context: {
                structMetadata: metadata,
                types: metadata.types,
                errors: unionErrorList,
            },
        })
    }
}
