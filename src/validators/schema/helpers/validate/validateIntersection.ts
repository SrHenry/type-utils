import type { TypeGuard } from '../../../../TypeGuards/types/index.ts'
import type { V3 } from '../../types/index.ts'
import type { ValidationContext } from './ValidationContext.ts'

import { isInstanceOf } from '../../../../TypeGuards/helpers/isInstanceOf.ts'
import { validateRules } from '../../../RuleValidator.ts'
import { updateStructMetadata } from '../updateStructMetadata.ts'
import { ValidationErrors } from '../../../ValidationErrors.ts'
import { isOptionalCheck } from './helpers/isOptionalCheck.ts'

type ValidateFn = (this: unknown, arg: unknown, schema: TypeGuard<any>, ...args: any[]) => unknown

export function validateIntersection(
    ctx: ValidationContext,
    validate: ValidateFn,
    mustNotThrowCtx: unknown
): void {
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
            validate.bind(mustNotThrowCtx)(ctx.arg, schema, {
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

    const intersectionErrors = intersectionResults
        .filter(isInstanceOf(ValidationErrors))
        .filter(e => e !== ctx.arg)

    if (intersectionErrors.length === 0) return

    const intersectionErrorList = intersectionErrors.flatMap(item => [...item])

    ctx.pushNewError({
        message: 'Value does not match all intersection types',
        context: {
            types: metadata.types.filter((_, i) =>
                intersectionResults
                    .map((r, idx) => [idx, r] as const)
                    .filter(([, r]) => isInstanceOf(r, ValidationErrors) && r !== ctx.arg)
                    .map(([idx]) => idx)
                    .includes(i)
            ),
            errors: intersectionErrorList,
        },
    })

    ctx.errors.push(...intersectionErrorList)
}
