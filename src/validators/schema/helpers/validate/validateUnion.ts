import type { TypeGuard } from '../../../../TypeGuards/types/index.ts'
import type { V3 } from '../../types/index.ts'
import type { ValidationContext } from './ValidationContext.ts'

import { isInstanceOf } from '../../../../TypeGuards/helpers/isInstanceOf.ts'
import { validateRules } from '../../../RuleValidator.ts'
import { updateStructMetadata } from '../updateStructMetadata.ts'
import { ValidationErrors } from '../../../ValidationErrors.ts'
import { isOptionalCheck } from './helpers/isOptionalCheck.ts'

type ValidateFn = (this: unknown, arg: unknown, schema: TypeGuard<any>, ...args: any[]) => unknown

export function validateUnion(
    ctx: ValidationContext,
    validate: ValidateFn,
    mustNotThrowCtx: unknown
): void {
    const metadata = ctx.metadata as V3.UnionStruct<any[]>

    if (isOptionalCheck(metadata, ctx.arg)) return

    const unionResults = metadata.types.map(({ schema, rules: unionInnerRule }) =>
        validate.bind(mustNotThrowCtx)(
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

    const unionErrors = unionResults
        .filter(isInstanceOf(ValidationErrors))
        .filter(e => e !== ctx.arg)

    if (unionErrors.length === unionResults.length) {
        const unionErrorList = unionErrors.flatMap(e => Array.from(e))

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
