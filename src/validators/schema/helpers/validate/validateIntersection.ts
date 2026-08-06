import type { TypeGuard } from '../../../../TypeGuards/types/index.ts'
import type { Result } from '../../../../types/Result.ts'
import type { V3 } from '../../types/index.ts'
import type { ValidationContext } from './ValidationContext.ts'

import { validateRules } from '../../../RuleValidator.ts'
import { updateStructMetadata } from '../updateStructMetadata.ts'
import type { ValidationErrors } from '../../../ValidationErrors.ts'
import { isOptionalCheck } from './helpers/isOptionalCheck.ts'

type ValidateFn = (
    arg: unknown,
    schema: TypeGuard<any>,
    ...args: any[]
) => Result<unknown, ValidationErrors>

export function validateIntersection(ctx: ValidationContext, validate: ValidateFn): void {
    const metadata = ctx.metadata as V3.IntersectionStruct<any[]>

    if (isOptionalCheck(metadata, ctx.arg)) return

    const intersectionResults = metadata.types
        .map(s => {
            updateStructMetadata(s.schema, {
                rules: s.rules as any,
            })

            return s
        })
        .map(({ schema }) =>
            validate(ctx.arg, schema, {
                name: ctx.name,
                parent: ctx.parent,
            })
        )

    const intersectionRulesResults = validateRules(
        ctx.arg,
        metadata.rules,
        ctx.schema,
        ctx.name,
        ctx.parent
    )

    ctx.errors.push(...intersectionRulesResults)

    const intersectionErrors = intersectionResults.filter(
        (r): r is [ValidationErrors, null] => (r as Result<unknown, ValidationErrors>)[0] !== null
    )

    if (intersectionErrors.length === 0) return

    const intersectionErrorList = intersectionErrors.flatMap(([err]) => Array.from(err))

    const failingIndexes = intersectionResults
        .map((r, idx) => [idx, r] as const)
        .filter(([, r]) => (r as Result<unknown, ValidationErrors>)[0] !== null)
        .map(([idx]) => idx)

    ctx.pushNewError({
        message: 'Value does not match all intersection types',
        context: {
            types: metadata.types.filter((_, i) => failingIndexes.includes(i)),
            errors: intersectionErrorList,
        },
    })

    ctx.errors.push(...intersectionErrorList)
}
