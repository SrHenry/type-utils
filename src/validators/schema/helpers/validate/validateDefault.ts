import type { TypeGuard } from '../../../../TypeGuards/types/index.ts'
import type { V3 } from '../../types/index.ts'
import type { ValidationContext } from './ValidationContext.ts'

import Generics from '../../../../Generics/index.ts'
import { ensureInterface } from '../../../../TypeGuards/helpers/ensureInterface.ts'
import { getValidatorMessage } from '../../../../TypeGuards/helpers/getValidatorMessage.ts'
import { isInstanceOf } from '../../../../TypeGuards/helpers/isInstanceOf.ts'
import { TypeGuardError } from '../../../../TypeGuards/TypeErrors.ts'
import { doesNotMatchRules, validateRules } from '../../../RuleValidator.ts'
import { isStruct } from '../isStruct.ts'
import { ValidationErrors } from '../../../ValidationErrors.ts'
import { isOptionalCheck } from './helpers/isOptionalCheck.ts'

const NO_PARENT = Symbol('SchemaValidator::validate::NO_PARENT')

type ValidateFn = (this: unknown, arg: unknown, schema: TypeGuard<any>, ...args: any[]) => unknown

export function validateDefault(
    ctx: ValidationContext,
    validate: ValidateFn,
    mustNotThrowCtx: unknown
): void {
    if (isOptionalCheck(ctx.metadata, ctx.arg)) return

    try {
        ensureInterface(ctx.arg, ctx.schema)

        if (doesNotMatchRules(ctx.arg, ctx.metadata.rules, ctx.schema, ctx.name, ctx.parent))
            throw new TypeGuardError('Value does not match all rules', ctx.arg, ctx.metadata.rules)
    } catch (e) {
        if (!(e instanceof TypeGuardError))
            throw new TypeError(`Expected TypeGuardError, got ${(e as Error)?.name}`, {
                cause: e,
            })

        validateDefaultInner(ctx, validate, mustNotThrowCtx)
    }
}

function validateDefaultInner(
    ctx: ValidationContext,
    validate: ValidateFn,
    mustNotThrowCtx: unknown
): void {
    switch (ctx.metadata.type) {
        case 'custom':
            if (!(ctx.metadata as V3.CustomStruct<any>).schema(ctx.arg)) {
                ctx.pushNewError({
                    message: getValidatorMessage(
                        ctx.schema,
                        'Value does not match the custom schema'
                    ),
                    context: {
                        structMetadata: ctx.metadata,
                        expectedType: ctx.metadata.type,
                        actualType: typeof ctx.arg,
                    },
                })
            }
            break
        case 'any':
            break
        case 'tuple':
            validateDefaultTuple(ctx, validate, mustNotThrowCtx)
            break
        case 'primitive':
            if (!(Generics.Primitives as readonly string[]).includes(typeof ctx.arg))
                ctx.pushNewError({
                    message: getValidatorMessage(ctx.schema, `Value must be a primitive`),
                    context: {
                        structMetadata: ctx.metadata,
                        expectedType: ctx.metadata.type,
                        actualType: typeof ctx.arg,
                    },
                })
            break
        case 'enum':
            validateDefaultEnum(ctx, validate, mustNotThrowCtx)
            break
        case 'null':
            if (ctx.arg !== null)
                ctx.pushNewError({
                    message: getValidatorMessage(ctx.schema, `Value must be null`),
                    context: {
                        structMetadata: ctx.metadata,
                        expectedType: ctx.metadata.type,
                        actualType: typeof ctx.arg,
                    },
                })
            break
        default:
            if (typeof ctx.arg !== ctx.metadata.type)
                ctx.pushNewError({
                    message: getValidatorMessage(
                        ctx.schema,
                        `Value must be of type "${ctx.metadata.type}"`
                    ),
                    context: {
                        structMetadata: ctx.metadata,
                        expectedType: ctx.metadata.type,
                        actualType: typeof ctx.arg,
                    },
                })
            else if (!ctx.schema(ctx.arg))
                ctx.pushNewError({
                    message: getValidatorMessage(
                        ctx.schema,
                        `Value must pass inner schema validations "${ctx.metadata.type}"`
                    ),
                    context: {
                        structMetadata: ctx.metadata,
                        expectedType: ctx.metadata.type,
                        actualType: typeof ctx.arg,
                        schema: ctx.schema,
                    },
                })
    }

    const ruleErrors = validateRules(
        ctx.arg,
        ctx.metadata.rules,
        ctx.schema,
        ctx.name,
        ctx.parent
    ).errors

    ctx.errors.push(...ruleErrors)
}

function validateDefaultTuple(
    ctx: ValidationContext,
    validate: ValidateFn,
    mustNotThrowCtx: unknown
): void {
    const metadata = ctx.metadata as V3.TupleStruct<any[]>

    if (!Array.isArray(ctx.arg) || ctx.arg.length !== metadata.elements.length) {
        ctx.pushNewError({
            message: getValidatorMessage(
                ctx.schema,
                `Value must be a tuple/array of length ${metadata.elements.length}`
            ),
            context: {
                structMetadata: metadata,
                expectedType: metadata.type,
                actualType: typeof ctx.arg,
                expectedLength: metadata.elements.length,
                actualLength: Array.isArray(ctx.arg) ? ctx.arg.length : null,
            },
        })
        return
    }

    if (!metadata.elements.every(isStruct))
        throw new TypeGuardError(
            'Tuple metadata must have elements that are structs',
            metadata.elements,
            isStruct
        )

    const arg = ctx.arg as any[]

    metadata.elements
        .map((innerStruct: V3.GenericStruct<any>, i: number) =>
            validate.bind(mustNotThrowCtx)(
                arg[i],
                innerStruct.schema,
                `${ctx.name}[<tuple>.at{${i}}]`,
                ctx.parent
            )
        )
        .filter(isInstanceOf(ValidationErrors))
        .forEach((innerErrors: ValidationErrors) => {
            ctx.errors.push(...innerErrors)
        })
}

function validateDefaultEnum(
    ctx: ValidationContext,
    validate: ValidateFn,
    mustNotThrowCtx: unknown
): void {
    const metadata = ctx.metadata as V3.EnumStruct<any>

    if (metadata.types.length < 2)
        throw new TypeError('An enum schema must have at least two values to match')

    if (!(Generics.Primitives as readonly string[]).includes(typeof ctx.arg))
        ctx.pushNewError({
            message: getValidatorMessage(ctx.schema, `Value must be a primitive`),
            context: {
                structMetadata: metadata,
                expectedType: metadata.type,
                actualType: typeof ctx.arg,
            },
        })

    const enumResults = metadata.types.map(enumElementStruct =>
        validate.bind(mustNotThrowCtx)(ctx.arg, enumElementStruct.schema, {
            name: ctx.name,
            parent: ctx.parent === NO_PARENT ? undefined : ctx.parent,
        })
    )

    const enumErrorCount = enumResults.filter(isInstanceOf(ValidationErrors)).length

    if (enumResults.length - enumErrorCount > 1)
        throw new TypeError('Invalid Enum State! Multiple matches found!')

    if (enumErrorCount === enumResults.length)
        ctx.pushNewError({
            message: getValidatorMessage(ctx.schema, `Value does not match any of the enum values`),
            context: {
                structMetadata: metadata,
                expected: { roMatch: { xor: metadata.types } },
            },
        })
}
