import type { TypeGuard } from '../../../../TypeGuards/types/index.ts'
import type { V3 } from '../../types/index.ts'
import type { ValidationContext } from './ValidationContext.ts'

import Generics from '../../../../Generics/index.ts'
import { asTypeGuard } from '../../../../TypeGuards/helpers/asTypeGuard.ts'
import { isInstanceOf } from '../../../../TypeGuards/helpers/isInstanceOf.ts'
import { nonEmpty as nonEmptyRecordRuleFactory } from '../../../rules/Record/factories/nonEmpty.ts'
import { getRuleStructMetadata } from '../getRuleStructMetadata.ts'
import { updateStructMetadata } from '../updateStructMetadata.ts'
import type { ValidationError } from '../../../ValidationError.ts'
import { ValidationErrors } from '../../../ValidationErrors.ts'
import { isOptionalCheck } from './helpers/isOptionalCheck.ts'
import { buildPath } from './helpers/buildPath.ts'

type ValidateFn = (this: unknown, arg: unknown, schema: TypeGuard<any>, ...args: any[]) => unknown

export function validateRecord(
    ctx: ValidationContext,
    validate: ValidateFn,
    mustNotThrowCtx: unknown
): void {
    const metadata = ctx.metadata as V3.RecordStruct<string, any>

    if (isOptionalCheck(metadata, ctx.arg)) return

    const { keyMetadata, valueMetadata, rules } = metadata
    const recordEntriesCount =
        Object.getOwnPropertyNames(ctx.arg).length + Object.getOwnPropertySymbols(ctx.arg).length

    if (rules.includes(getRuleStructMetadata(nonEmptyRecordRuleFactory())))
        if (typeof ctx.arg !== 'object' || ctx.arg === null || recordEntriesCount === 0)
            ctx.pushNewError({
                message: 'Value must be a not-null object and a non-empty record object!',
                context: {
                    structMetadata: metadata,
                    isNull: ctx.arg === null,
                    isEmpty: !(recordEntriesCount > 0),
                },
            })

    switch (keyMetadata.type) {
        case 'enum': {
            validateRecordEnumKeys(
                ctx,
                keyMetadata as V3.EnumStruct<PropertyKey>,
                valueMetadata,
                validate,
                mustNotThrowCtx
            )
            break
        }
        case 'string':
        case 'number':
        case 'symbol':
        case 'custom': {
            validateRecordPropertyKeys(ctx, keyMetadata, valueMetadata, validate, mustNotThrowCtx)
            break
        }
        default:
            throw new TypeError(
                "Invalid metadata for record key guard. record key guard must be of type 'string', 'number', 'symbol', or 'enum<string | number | symbol>'"
            )
    }
}

function validateRecordEnumKeys(
    ctx: ValidationContext,
    keyMetadata: V3.EnumStruct<PropertyKey>,
    valueMetadata: V3.RecordMetadata<Record<PropertyKey, unknown>>['valueMetadata'],
    validate: ValidateFn,
    mustNotThrowCtx: unknown
): void {
    if (
        !keyMetadata.types.every(({ type: enumInnerType }) =>
            Generics.PropertyKeyTypes.includes(enumInnerType)
        )
    )
        throw new TypeError(
            "Invalid metadata for record key guard enum. record key guard enum must be of type 'string', 'number', or 'symbol'"
        )

    const ownKeys = [
        Object.getOwnPropertyNames(ctx.arg),
        Object.getOwnPropertySymbols(ctx.arg),
    ].flat()

    const recordValidationResult = ownKeys
        .flatMap(k => [
            validate.bind(mustNotThrowCtx)(
                k,
                (_i: unknown): _i is string | symbol =>
                    keyMetadata.types
                        .map(
                            ({
                                schema: keySchema,
                                type: keyType,
                            }): TypeGuard<string> | TypeGuard<symbol> =>
                                keyType === 'number'
                                    ? asTypeGuard<string>(
                                          (input: string) =>
                                              Number.isNaN(Number(input)) &&
                                              keySchema(Number(input))
                                      )
                                    : keySchema
                        )
                        .some(typeGuard => typeGuard(_i)),
                {
                    name: buildPath(
                        ctx.name,
                        `[@@Object.{getOwnPropertyNames|getOwnPropertySymbols} @key: ${String(k)}]`
                    ),
                    parent: ctx.arg,
                }
            ),
            validate.bind(mustNotThrowCtx)(
                (ctx.arg as Record<PropertyKey, unknown>)[k as keyof typeof ctx.arg],
                valueMetadata.schema,
                {
                    name: buildPath(
                        ctx.name,
                        `[@values:at: @@Object.{getOwnPropertyNames|getOwnPropertySymbols}]`
                    ),
                    parent: ctx.arg,
                }
            ),
        ])
        .filter(isInstanceOf(ValidationErrors))
        .flatMap(validationErrors => validationErrors.errors)

    ctx.errors.push(...recordValidationResult)
}

type KeyAccessorType = 'number' | 'string' | 'symbol'

type KeyAccessorConfig = {
    getKeys: (arg: object) => (string | number | symbol)[]
    keyType: KeyAccessorType
    isCustomKindString: boolean
    formatKeyName: (k: string | number | symbol) => string
    formatValueName: (k: string | number | symbol) => string
    coerceKey?: (k: string | number | symbol) => unknown
}

function validateRecordPropertyKeys(
    ctx: ValidationContext,
    keyMetadata: V3.RecordMetadata<Record<PropertyKey, unknown>>['keyMetadata'],
    valueMetadata: V3.RecordMetadata<Record<PropertyKey, unknown>>['valueMetadata'],
    validate: ValidateFn,
    mustNotThrowCtx: unknown
): void {
    updateStructMetadata<string | number | symbol>(keyMetadata.schema, {
        rules: keyMetadata.rules as any,
    })

    if (typeof ctx.arg !== 'object' || ctx.arg === null) {
        ctx.pushNewError({
            message: 'Value must be a not-null object!',
            context: {
                structMetadata: ctx.metadata,
                expectedMetadataProperties: {
                    key: Generics.PropertyKeyTypes,
                },
            },
        })

        return
    }

    const accessorConfigs: KeyAccessorConfig[] = []

    if (keyMetadata.type === 'number') {
        accessorConfigs.push({
            getKeys: Object.getOwnPropertyNames,
            keyType: 'number',
            isCustomKindString: false,
            formatKeyName: k => `[@@key: ${String(k)}]`,
            formatValueName: k => `[@@value:at(${String(k)})]`,
            coerceKey: k => Number(k),
        })
    } else if (
        keyMetadata.type === 'string' ||
        (keyMetadata.type === 'custom' && (keyMetadata as any).kind === 'string')
    ) {
        accessorConfigs.push({
            getKeys: Object.getOwnPropertyNames,
            keyType: 'string',
            isCustomKindString: keyMetadata.type === 'custom',
            formatKeyName: k => `[@@key: '${String(k)}']`,
            formatValueName: k => `[@@value:at('${String(k)}')]`,
        })
    } else if (keyMetadata.type === 'symbol') {
        accessorConfigs.push({
            getKeys: Object.getOwnPropertySymbols as (arg: object) => symbol[],
            keyType: 'symbol',
            isCustomKindString: false,
            formatKeyName: k => `[@@key: ${String(k)}]`,
            formatValueName: k => `[@@value:at(${String(k)})]`,
        })
    }

    for (const config of accessorConfigs) {
        const keys = config.getKeys(ctx.arg as object)

        for (const k of keys) {
            validateRecordKeyEntry(
                ctx,
                keyMetadata,
                valueMetadata,
                k,
                config,
                validate,
                mustNotThrowCtx
            )
        }
    }
}

function validateRecordKeyEntry(
    ctx: ValidationContext,
    keyMetadata: V3.RecordMetadata<Record<PropertyKey, unknown>>['keyMetadata'],
    valueMetadata: V3.RecordMetadata<Record<PropertyKey, unknown>>['valueMetadata'],
    k: string | number | symbol,
    config: KeyAccessorConfig,
    validate: ValidateFn,
    mustNotThrowCtx: unknown
): void {
    if (config.keyType === 'number' && typeof k === 'string') {
        if (!Number.isNaN(Number(k)))
            ctx.pushNewError({
                message: `Value's key must be a number or number string`,
                context: {
                    structMetadata: ctx.metadata,
                    expectedKeyType: keyMetadata.type,
                    actualKeyType: typeof k,
                    isNumberString: !Number.isNaN(Number(k)),
                    isNumberLiteral: typeof k === 'number',
                },
            })
    }

    const keyForValidation = config.coerceKey ? config.coerceKey(k) : k

    const recordKeyValidationResult = validate.bind(mustNotThrowCtx)(
        keyForValidation,
        keyMetadata.schema,
        {
            name: buildPath(ctx.name, config.formatKeyName(k)),
            parent: ctx.arg,
        }
    )

    if (
        recordKeyValidationResult !== keyForValidation &&
        recordKeyValidationResult instanceof ValidationErrors
    )
        ctx.errors.push(...(recordKeyValidationResult.errors as ValidationError<any, any>[]))

    const recordValueValidationResult = validate.bind(mustNotThrowCtx)(
        (ctx.arg as Record<PropertyKey, unknown>)[k],
        valueMetadata.schema,
        {
            name: buildPath(ctx.name, config.formatValueName(k)),
            parent: ctx.arg,
        }
    )
    if (
        recordValueValidationResult !== (ctx.arg as Record<PropertyKey, unknown>)[k] &&
        recordValueValidationResult instanceof ValidationErrors
    )
        ctx.errors.push(...(recordValueValidationResult.errors as ValidationError<any, any>[]))
}
