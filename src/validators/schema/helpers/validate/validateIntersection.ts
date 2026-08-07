import type { Result } from '../../../../types/Result.ts'
import type { V3 } from '../../types/index.ts'
import type { ValidationContext, ValidateFn } from './ValidationContext.ts'

import { validateRules } from '../../../RuleValidator.ts'
import { updateStructMetadata } from '../updateStructMetadata.ts'
import type { ValidationErrors } from '../../../ValidationErrors.ts'
import { isOptionalCheck } from './helpers/isOptionalCheck.ts'

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

    // Single pass: derive failing indexes and the per-result error list together.
    // We need both (a) the flat list of ValidationError instances for the failing
    // sub-results (consumed by ctx.pushNewError's `errors` context and ctx.errors)
    // and (b) the indexes so we can filter `metadata.types` for the `types` field.
    const failing = intersectionResults
        .map((r, idx) => {
            const [err] = r as Result<unknown, ValidationErrors>
            return [idx, err] as const
        })
        .filter((entry): entry is readonly [number, ValidationErrors] => entry[1] !== null)

    if (failing.length === 0) return

    const intersectionErrorList = failing.flatMap(([, err]) => Array.from(err))
    const failingIndexes = failing.map(([idx]) => idx)

    ctx.pushNewError({
        message: 'Value does not match all intersection types',
        context: {
            types: metadata.types.filter((_, i) => failingIndexes.includes(i)),
            errors: intersectionErrorList,
        },
    })

    ctx.errors.push(...intersectionErrorList)
}
