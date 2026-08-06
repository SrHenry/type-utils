import type { TypeGuard } from '../../../../TypeGuards/types/index.ts'
import type { Result } from '../../../../types/Result.ts'
import type { V3 } from '../../types/index.ts'
import type { ValidationContext } from './ValidationContext.ts'

import { getMessage } from '../../../../TypeGuards/helpers/getMessage.ts'
import { validateRules } from '../../../RuleValidator.ts'
import { updateStructMetadata } from '../updateStructMetadata.ts'
import { ValidationError } from '../../../ValidationError.ts'
import { ValidationErrors } from '../../../ValidationErrors.ts'
import { isOptionalCheck } from './helpers/isOptionalCheck.ts'
import { buildPath } from './helpers/buildPath.ts'

type ValidateFn = (
    arg: unknown,
    schema: TypeGuard<any>,
    ...args: any[]
) => Result<unknown, ValidationErrors>

export function validateObject(ctx: ValidationContext, validate: ValidateFn): void {
    const metadata = ctx.metadata as V3.ObjectStruct<any> | V3.ArrayStruct<any>

    if (isOptionalCheck(metadata, ctx.arg)) return

    if (!isValidObject(ctx.arg)) {
        ctx.pushNewError(getMessage(ctx.schema) ?? `Expected object, got ${typeof ctx.arg}`)
        return
    }

    {
        const ruleErrors = validateRules(
            ctx.arg,
            metadata.rules as any,
            ctx.schema,
            ctx.name,
            ctx.parent
        )
        ctx.errors.push(...ruleErrors)
    }

    if ('tree' in metadata) {
        validateObjectTree(ctx, metadata as V3.ObjectStruct<any>, validate)
    } else if ('entries' in metadata) {
        validateObjectEntries(ctx, metadata as V3.ArrayStruct<any>, validate)
    } else {
        ctx.pushNewError({
            message: 'Invalid metadata for object',
            context: {
                structMetadata: metadata,
                expectedMetadataProperties: {
                    xor: [
                        { key: 'tree', type: 'object' },
                        { key: 'entries', type: 'object' },
                    ],
                },
            },
        })
    }
}

function isValidObject(arg: unknown): boolean {
    return !!arg && typeof arg === 'object'
}

function validateObjectTree(
    ctx: ValidationContext,
    metadata: V3.ObjectStruct<any>,
    validate: ValidateFn
): void {
    if (isOptionalCheck(metadata, ctx.arg)) return

    if ('className' in metadata) {
        // biome-ignore lint/suspicious/noShadowRestrictedNames: destructured class constructor reference
        const { constructor, className } = metadata

        if (!(ctx.arg instanceof constructor)) {
            ctx.pushNewError({
                message: getMessage(ctx.schema) ?? `Expected ${className} instance, got ${ctx.arg}`,
                context: { structMetadata: metadata, constructor, className },
            })
        }

        return
    }

    const entries = Object.entries(ctx.arg as Record<string, unknown>)
    const { tree } = metadata

    const results = Object.entries(tree)
        .map(e => {
            const [, { schema, rules: objectEntryRules }] = e

            updateStructMetadata(schema, {
                rules: objectEntryRules as any,
            })

            return e
        })
        .map(([k, treeEntry]: [string, any]): [any, any] => {
            const { schema, optional } = treeEntry
            if (entries.some(([key]) => key === k))
                return [
                    schema,
                    validate(
                        (ctx.arg as Record<string, unknown>)[k],
                        schema,
                        [ctx.name, k].filter(Boolean).join('.'),
                        ctx.arg
                    ),
                ]

            if (optional) return [schema, [null, void 0] as Result<unknown, ValidationErrors>]

            return [
                schema,
                [
                    new ValidationErrors([
                        new ValidationError({
                            schema,
                            value: (ctx.arg as Record<string, unknown>)[k],
                            message: `Missing key '${k}'`,
                            name: ctx.name,
                            parent: ctx.parent,
                            context: {
                                structMetadata: metadata,
                                missingKey: k,
                            },
                        }),
                    ]),
                    null,
                ] as Result<unknown, ValidationErrors>,
            ]
        })

    for (const [, r] of results) {
        const [err] = r as Result<unknown, ValidationErrors>
        if (err) ctx.errors.push(...Array.from(err.errors))
    }
}

function validateObjectEntries(
    ctx: ValidationContext,
    metadata: V3.ArrayStruct<any>,
    validate: ValidateFn
): void {
    const { entries, optional } = metadata

    if (optional && ctx.arg === void 0) return

    if (!Array.isArray(ctx.arg)) {
        ctx.pushNewError({
            message: `Expected array, got <${ctx.arg}>${JSON.stringify(ctx.arg)}`,
            context: { structMetadata: metadata },
        })

        return
    }

    const results = ctx.arg.map((item, i) =>
        validate(item, entries.schema, {
            name: buildPath(ctx.name, `[${i}]`),
            parent: ctx.arg,
        })
    )

    for (const r of results) {
        const [err] = r as Result<unknown, ValidationErrors>
        if (err) ctx.errors.push(...Array.from(err.errors))
    }
}
