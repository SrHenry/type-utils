import type { GetTypeGuard, MessageFormator, TypeGuard } from '../TypeGuards/types'
import type { Merge } from '../types'
import type { Custom as CustomRules, RuleStruct } from './rules/types/'
import type { GenericStruct, V3 } from './schema/types'
import type { ValidatorMessageMap } from './types'

import Generics from '../Generics'
import { AutoBind } from '../helpers/decorators/stage-2/AutoBind'
import { asTypeGuard } from '../TypeGuards/helpers/asTypeGuard'
import { ensureInterface } from '../TypeGuards/helpers/ensureInterface'
import { getMessage } from '../TypeGuards/helpers/getMessage'
import { getMetadata } from '../TypeGuards/helpers/getMetadata'
import { getValidatorMessage } from '../TypeGuards/helpers/getValidatorMessage'
import { hasValidatorMessage } from '../TypeGuards/helpers/hasValidatorMessage'
import { isInstanceOf } from '../TypeGuards/helpers/isInstanceOf'
import { setMetadata } from '../TypeGuards/helpers/setMetadata'
import { setValidatorMessage } from '../TypeGuards/helpers/setValidatorMessage'
import { setValidatorMessageFormator } from '../TypeGuards/helpers/setValidatorMessageFormator'
import { TypeGuardError } from '../TypeGuards/TypeErrors'
import { isValidObject } from './helpers/isValidObject'
import { nonEmpty as nonEmptyRecordRuleFactory } from './rules/Record/factories/nonEmpty'
import { doesNotMatchRules, validateRules } from './RuleValidator'
import { getRuleStructMetadata } from './schema/helpers/getRuleStructMetadata'
import { getStructMetadata } from './schema/helpers/getStructMetadata'
import { hasStructMetadata } from './schema/helpers/hasStructMetadata'
import { isStruct } from './schema/helpers/isStruct'
import { updateStructMetadata } from './schema/helpers/updateStructMetadata'
import { type ValidationArgs, ValidationError } from './ValidationError'
import { ValidationErrors } from './ValidationErrors'

export type ValidateReturn<T> =
    | T
    | ValidationErrors<
          | ValidationError<unknown, T>
          | ValidationError<unknown, T[Extract<keyof T, string>], Extract<keyof T, string>, T>
          | ValidationError
      >

type ValidateOptionalArgs<Name extends string = string, Parent = any> = {
    name?: Name
    parent?: Parent
}

const defaults = {
    get throws() {
        return true
    },
} as const
type DefaultThrowsParam = (typeof defaults)['throws']

const throws = Symbol('[@srhenry/type-utils]:/validators/SchemaValidator/__throws__')

const shouldThrow = (subject: unknown): boolean =>
    getMetadata(
        throws,
        subject,
        asTypeGuard<boolean>(e => typeof e === 'boolean')
    ) ?? defaults.throws

const mustNotThrow = <T>(subject: T = {} as T) => setThrows(false, subject)

const setThrows = <T>(value: boolean, subject: T = {} as T) => setMetadata(throws, value, subject)

type ValidationArgsStaticValues = 'name' | 'parent' | 'schema' | 'value'
function pushNewErrorFactory<
    TValue,
    TSchema,
    TName extends string,
    TParent,
    TArgs extends Pick<ValidationArgs<TValue, TSchema, TName, TParent>, ValidationArgsStaticValues>,
>(errors: ValidationError<TValue, TSchema, TName, TParent>[], staticValues: TArgs) {
    function pushNewError<TContext extends {}>(
        args: Omit<
            ValidationArgs<TValue, TSchema, TName, TParent, TContext>,
            ValidationArgsStaticValues
        >
    ): void
    function pushNewError(
        args: Omit<
            ValidationArgs<TValue, TSchema, TName, TParent, null>,
            ValidationArgsStaticValues
        >
    ): void
    function pushNewError<TMessage extends string>(message: TMessage): void

    function pushNewError(
        args:
            | string
            | Omit<ValidationArgs<TValue, TSchema, TName, TParent>, ValidationArgsStaticValues>
    ) {
        errors.push(
            new ValidationError<TValue, TSchema, TName, TParent>({
                ...staticValues,
                ...(typeof args === 'string' ? { message: args } : args),
            })
        )
    }

    return pushNewError
}

const NO_PARENT = Symbol('SchemaValidator::validate::NO_PARENT')
declare type NO_PARENT = typeof NO_PARENT

function validate<T>(arg: unknown, schema: TypeGuard<T>): ValidateReturn<T>
function validate<T, Name extends string = string, Parent = any>(
    arg: unknown,
    schema: TypeGuard<T>,
    options: ValidateOptionalArgs<Name, Parent>
): ValidateReturn<T>
function validate<T, Name extends string, Parent>(
    arg: unknown,
    schema: TypeGuard<T>,
    name: Name,
    parent: Parent
): ValidateReturn<T>

function validate<T, Name extends string, Parent>(
    this: unknown,
    arg: unknown,
    schema: TypeGuard<T>,
    name_or_options?: Name | ValidateOptionalArgs<Name, Parent>,
    parent: Parent | NO_PARENT = NO_PARENT
): ValidateReturn<T> {
    const throws = shouldThrow(this)
    const metadata = getStructMetadata(schema) as V3.StructType
    const errors: ValidationError[] = []
    let name: Name | undefined

    // Sanitize name and parent
    {
        ;({ name, parent = NO_PARENT } =
            typeof name_or_options === 'string'
                ? { name: name_or_options }
                : (name_or_options ?? {}))

        if (parent === NO_PARENT) name ??= '$' as Name
    }

    const pushNewError = pushNewErrorFactory(errors, { schema, value: arg, name, parent })

    if (!hasStructMetadata(schema)) {
        try {
            ensureInterface(arg, schema)
        } catch (e) {
            if (!(e instanceof TypeGuardError)) throw e

            let { message } = e

            if (hasValidatorMessage(schema)) message = getValidatorMessage(schema)!

            pushNewError({
                message,
                context: {
                    hasStructMetadata: false,
                },
            })
        }
    } else {
        switch (metadata.type) {
            case 'object':
                {
                    if (metadata.optional && arg === undefined) break

                    if (!isValidObject(arg)) {
                        pushNewError(getMessage(schema) ?? `Expected object, got ${typeof arg}`)

                        break
                    }

                    // Validate object's own rules before the tree/entries
                    {
                        const ruleErrors = validateRules(arg, metadata.rules, schema, name, parent)

                        errors.push(...ruleErrors)
                    }

                    if ('tree' in metadata) {
                        if (metadata.optional && arg === undefined) break

                        if ('className' in metadata) {
                            const { constructor, className } = metadata

                            if (!(arg instanceof constructor)) {
                                pushNewError({
                                    message:
                                        getMessage(schema) ??
                                        `Expected ${className} instance, got ${arg}`,
                                    context: { structMetadata: metadata, constructor, className },
                                })
                            }

                            break
                        }

                        const entries = Object.entries(arg)
                        const { tree } = metadata

                        const results = Object.entries(tree)
                            .map(e => {
                                const [, { schema, rules: objectEntryRules }] = e

                                updateStructMetadata(schema, {
                                    rules: objectEntryRules as RuleStruct<CustomRules>[],
                                })

                                return e
                            })
                            .map(
                                ([k, { schema, optional }]): [
                                    (typeof tree)[Exclude<keyof typeof tree, symbol>]['schema'],
                                    (
                                        | GetTypeGuard<
                                              (typeof tree)[Exclude<
                                                  keyof typeof tree,
                                                  symbol
                                              >]['schema']
                                          >
                                        | ValidationError<
                                              typeof arg,
                                              (typeof tree)[Exclude<
                                                  keyof typeof tree,
                                                  symbol
                                              >]['schema']
                                          >[]
                                        | undefined
                                    ),
                                ] => {
                                    if (entries.some(([key]) => key === k))
                                        return [
                                            schema,
                                            validate.bind(mustNotThrow())(
                                                arg[k],
                                                schema,
                                                [name, k].filter(Boolean).join('.'),
                                                arg
                                            ),
                                        ]

                                    if (optional) return [schema, void 0]

                                    return [
                                        schema,
                                        new ValidationErrors([
                                            new ValidationError({
                                                schema,
                                                value: arg[k],
                                                message: `Missing key '${k}'`,
                                                name,
                                                parent,
                                                context: {
                                                    structMetadata: metadata,
                                                    missingKey: k,
                                                },
                                            }),
                                        ]),
                                    ]
                                }
                            )

                        results
                            .filter((result): result is [TypeGuard<T>, ValidationErrors] => {
                                const [, item] = result
                                return (
                                    item instanceof ValidationErrors ||
                                    (Array.isArray(item) &&
                                        item.every(
                                            predicate => predicate instanceof ValidationError
                                        ))
                                )
                            })
                            .forEach(([, e]) => errors.push(...e.errors))
                    } else if ('entries' in metadata) {
                        const { entries, optional } = metadata

                        if (optional && arg === void 0) break

                        if (!Array.isArray(arg)) {
                            pushNewError({
                                message: `Expected array, got <${arg}>${JSON.stringify(arg)}`,
                                context: { structMetadata: metadata },
                            })

                            break
                        }

                        const results = arg.map((item, i) =>
                            validate.bind(mustNotThrow())(item, entries.schema, {
                                name: [name, `[${i}]`].filter(Boolean).join(''),
                                parent: arg,
                            })
                        )

                        results.filter(isInstanceOf(ValidationErrors)).forEach(item => {
                            errors.push(...item)
                        })
                    } else {
                        pushNewError({
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
                break
            case 'record':
                {
                    if (metadata.optional && arg === undefined) break

                    const { keyMetadata, valueMetadata, rules } = metadata
                    const recordEntriesCount =
                        Object.getOwnPropertyNames(arg).length +
                        Object.getOwnPropertySymbols(arg).length

                    if (rules.includes(getRuleStructMetadata(nonEmptyRecordRuleFactory())))
                        if (typeof arg !== 'object' || arg === null || recordEntriesCount === 0)
                            pushNewError({
                                message:
                                    'Value must be a not-null object and a non-empty record object!',
                                context: {
                                    structMetadata: metadata,
                                    isNull: arg === null,
                                    isEmpty: !(recordEntriesCount > 0),
                                },
                            })

                    switch (keyMetadata.type) {
                        case 'enum':
                            if (
                                !keyMetadata.types.every(({ type: enumInnerType }) =>
                                    Generics.PropertyKeyTypes.includes(enumInnerType)
                                )
                            )
                                throw new TypeError(
                                    "Invalid metadata for record key guard enum. record key guard enum must be of type 'string', 'number', or 'symbol'"
                                )

                            // for (const { type, schema: keySchema, rules: keyRules } of keyMetadata.types) {}
                            ///! TODO: Add proper record validation for Enum key guard case

                            const ownKeys = [
                                Object.getOwnPropertyNames(arg),
                                Object.getOwnPropertySymbols(arg),
                            ].flat() //as const

                            const recordValidationResult = ownKeys
                                .flatMap(k => [
                                    validate.bind(mustNotThrow())<string | symbol>(
                                        k,
                                        (_i: unknown): _i is string | symbol =>
                                            keyMetadata.types
                                                .map(
                                                    ({
                                                        schema,
                                                        type,
                                                    }): TypeGuard<string> | TypeGuard<symbol> =>
                                                        type === 'number'
                                                            ? asTypeGuard<string>(
                                                                  (input: string) =>
                                                                      Number.isNaN(Number(input)) &&
                                                                      schema(Number(input))
                                                              )
                                                            : schema
                                                )
                                                .some(typeGuard => typeGuard(_i)),
                                        {
                                            name: [
                                                name,
                                                `[@@Object.{getOwnPropertyNames|getOwnPropertySymbols} @key: ${k.toString()}]`,
                                            ]
                                                .filter(Boolean)
                                                .join(''),
                                            parent: arg,
                                        }
                                    ),
                                    validate.bind(mustNotThrow())(
                                        (arg as Record<PropertyKey, unknown>)[
                                            k as keyof typeof arg
                                        ],
                                        valueMetadata.schema,
                                        {
                                            name: [
                                                name,
                                                `[@values:at: @@Object.{getOwnPropertyNames|getOwnPropertySymbols}]`,
                                            ]
                                                .filter(Boolean)
                                                .join(''),
                                            parent: arg,
                                        }
                                    ),
                                ])
                                .filter(isInstanceOf(ValidationErrors))
                                .flatMap(errors => errors.errors)

                            errors.push(...recordValidationResult)
                            break
                        case 'string':
                        case 'number':
                        case 'symbol':
                        case 'custom':
                            updateStructMetadata<string | number | symbol>(keyMetadata.schema, {
                                rules: keyMetadata.rules as RuleStruct<CustomRules>[],
                            })

                            if (typeof arg !== 'object' || arg === null) {
                                pushNewError({
                                    message: 'Value must be a not-null object!',
                                    context: {
                                        structMetadata: metadata,
                                        expectedMetadataProperties: {
                                            key: Generics.PropertyKeyTypes,
                                        },
                                    },
                                })

                                break
                            }

                            switch (true) {
                                case keyMetadata.type === 'number':
                                    Object.getOwnPropertyNames(arg).forEach(k => {
                                        if (!Number.isNaN(Number(k)))
                                            pushNewError({
                                                message: `Value's key must be a number or number string`,
                                                context: {
                                                    structMetadata: metadata,

                                                    expectedKeyType: keyMetadata.type,
                                                    actualKeyType: typeof k,

                                                    isNumberString: !Number.isNaN(Number(k)),
                                                    isNumberLiteral: typeof k === 'number',
                                                },
                                            })

                                        const recordKeyValidationResult = validate.bind(
                                            mustNotThrow()
                                        )(Number(k), keyMetadata.schema, {
                                            name: [name, `[@@key: ${k}]`].filter(Boolean).join(''),
                                            parent: arg,
                                        })

                                        if (
                                            recordKeyValidationResult !== Number(k) &&
                                            recordKeyValidationResult instanceof ValidationErrors
                                        )
                                            errors.push(
                                                ...(recordKeyValidationResult.errors as ValidationError<
                                                    any,
                                                    any
                                                >[])
                                            )

                                        const recordValueValidationResult = validate.bind(
                                            mustNotThrow()
                                        )(arg[k as keyof typeof arg], valueMetadata.schema, {
                                            name: [name, `[@@value:at(${k})]`]
                                                .filter(Boolean)
                                                .join(''),
                                            parent: arg,
                                        })
                                        if (
                                            recordValueValidationResult !==
                                                arg[k as keyof typeof arg] &&
                                            recordValueValidationResult instanceof ValidationErrors
                                        )
                                            errors.push(
                                                ...(recordValueValidationResult.errors as ValidationError<
                                                    any,
                                                    any
                                                >[])
                                            )
                                    })

                                    break
                                case keyMetadata.type === 'string' ||
                                    (keyMetadata.type === 'custom' &&
                                        keyMetadata.kind === 'string'):
                                    Object.getOwnPropertyNames(arg).forEach(k => {
                                        const recordKeyValidationResult = validate.bind(
                                            mustNotThrow()
                                        )(k, keyMetadata.schema, {
                                            name: [name, `[@@key: '${k}']`]
                                                .filter(Boolean)
                                                .join(''),
                                            parent: arg,
                                        })

                                        if (
                                            recordKeyValidationResult !== k &&
                                            recordKeyValidationResult instanceof ValidationErrors
                                        )
                                            errors.push(
                                                ...(recordKeyValidationResult.errors as ValidationError<
                                                    any,
                                                    any
                                                >[])
                                            )

                                        const recordValueValidationResult = validate.bind(
                                            mustNotThrow()
                                        )(arg[k as keyof typeof arg], valueMetadata.schema, {
                                            name: [name, `[@@value:at('${k}')]`]
                                                .filter(Boolean)
                                                .join(''),
                                            parent: arg,
                                        })
                                        if (
                                            recordValueValidationResult !==
                                                arg[k as keyof typeof arg] &&
                                            recordValueValidationResult instanceof ValidationErrors
                                        )
                                            errors.push(
                                                ...(recordValueValidationResult.errors as ValidationError<
                                                    any,
                                                    any
                                                >[])
                                            )
                                    })
                                    break

                                case keyMetadata.type === 'symbol':
                                    Object.getOwnPropertySymbols(arg).forEach(k => {
                                        const recordKeyValidationResult = validate.bind(
                                            mustNotThrow()
                                        )(k, keyMetadata.schema, {
                                            name: [name, `[@@key: ${k.toString()}]`]
                                                .filter(Boolean)
                                                .join(''),
                                            parent: arg,
                                        })

                                        if (
                                            recordKeyValidationResult !== k &&
                                            recordKeyValidationResult instanceof ValidationErrors
                                        )
                                            errors.push(
                                                ...(recordKeyValidationResult.errors as ValidationError<
                                                    any,
                                                    any
                                                >[])
                                            )

                                        const recordValueValidationResult = validate.bind(
                                            mustNotThrow()
                                        )(arg[k as keyof typeof arg], valueMetadata.schema, {
                                            name: [name, `[@@value:at(${k.toString()})]`]
                                                .filter(Boolean)
                                                .join(''),
                                            parent: arg,
                                        })
                                        if (
                                            recordValueValidationResult !==
                                                arg[k as keyof typeof arg] &&
                                            recordValueValidationResult instanceof ValidationErrors
                                        )
                                            errors.push(
                                                ...(recordValueValidationResult.errors as ValidationError<
                                                    any,
                                                    any
                                                >[])
                                            )
                                    })
                                    break
                            }

                            break
                        default:
                            throw new TypeError(
                                "Invalid metadata for record key guard. record key guard must be of type 'string', 'number', 'symbol', or 'enum<string | number | symbol>'"
                            )
                    }
                }
                break
            case 'intersection':
                {
                    if (metadata.optional && arg === undefined) break

                    const intersectionResults = metadata.types
                        .map(s => {
                            updateStructMetadata(s.schema, {
                                rules: s.rules as RuleStruct<CustomRules>[],
                            })

                            return s
                        })
                        .map(({ schema }) =>
                            validate.bind(mustNotThrow())(arg, schema, {
                                name,
                                parent,
                            })
                        )

                    const intersectionRulesResults = validateRules(
                        arg,
                        metadata.rules,
                        schema,
                        name,
                        parent
                    )

                    errors.push(...intersectionRulesResults)

                    const intersectionErrors = intersectionResults
                        .filter(isInstanceOf(ValidationErrors))
                        .filter(e => e !== arg)

                    if (intersectionErrors.length === 0) break

                    const intersectionErrorList = intersectionErrors.map(item => [...item]).flat()

                    pushNewError({
                        message: 'Value does not match all intersection types',
                        context: {
                            types: metadata.types.filter((_, i) =>
                                intersectionResults
                                    .map((r, i) => [i, r])
                                    .filter(
                                        ([, r]) => isInstanceOf(r, ValidationError) && r !== arg
                                    )
                                    .map(([i]) => i)
                                    .includes(i)
                            ),
                            errors: intersectionErrorList,
                        },
                    })

                    errors.push(...intersectionErrorList)
                }
                break
            case 'union':
                {
                    if (metadata.optional && arg === undefined) break

                    const unionResults = metadata.types.map(({ schema, rules: unionInnerRules }) =>
                        validate.bind(mustNotThrow())(
                            arg,
                            updateStructMetadata(schema, {
                                rules: unionInnerRules as RuleStruct<CustomRules>[],
                            }),
                            {
                                name,
                                parent,
                            }
                        )
                    )

                    const unionRulesResults = validateRules(
                        arg,
                        metadata.rules,
                        schema,
                        name,
                        parent
                    )

                    errors.push(...unionRulesResults)

                    const unionErrors = unionResults
                        .filter(isInstanceOf(ValidationErrors))
                        .filter(e => e !== arg)

                    if (unionErrors.length === unionResults.length) {
                        const unionErrorList = unionErrors.map(e => Array.from(e)).flat()

                        pushNewError({
                            message: 'Value does not match any of the union types',
                            context: {
                                structMetadata: metadata,
                                types: metadata.types,
                                errors: unionErrorList,
                            },
                        })
                    }
                }
                break
            default:
                try {
                    // return ensureInterface(arg, schema)
                    ensureInterface(arg, schema)

                    if (doesNotMatchRules(arg, metadata.rules, schema, name, parent))
                        throw new TypeGuardError(
                            'Value does not match all rules',
                            arg,
                            metadata.rules
                        )
                } catch (e) {
                    if (!(e instanceof TypeGuardError))
                        throw new TypeError(`Expected TypeGuardError, got ${(e as Error)?.name}`, {
                            cause: e,
                        })

                    switch (metadata.type) {
                        case 'custom':
                            if (!metadata.schema(arg)) {
                                pushNewError({
                                    message: getValidatorMessage(
                                        schema,
                                        'Value does not match the custom schema'
                                    ),
                                    context: {
                                        structMetadata: metadata,
                                        expectedType: metadata.type,
                                        actualType: typeof arg,
                                    },
                                })
                            }

                            break
                        case 'any': //no test for `any`
                            break
                        case 'tuple':
                            if (!Array.isArray(arg) || arg.length !== metadata.elements.length) {
                                pushNewError({
                                    message: getValidatorMessage(
                                        schema,
                                        `Value must be a tuple/array of length ${metadata.elements.length}`
                                    ),
                                    context: {
                                        structMetadata: metadata,
                                        expectedType: metadata.type,
                                        actualType: typeof arg,
                                        expectedLength: metadata.elements.length,
                                        actualLength: Array.isArray(arg) ? arg.length : null,
                                    },
                                })
                                break
                            }

                            if (!metadata.elements.every(isStruct))
                                throw new TypeGuardError(
                                    'Tuple metadata must have elements that are structs',
                                    metadata.elements,
                                    isStruct
                                )

                            metadata.elements
                                .map((innerStruct, i) =>
                                    validate.bind(mustNotThrow())(
                                        arg[i],
                                        innerStruct.schema,
                                        `${name}[<tuple>.at{${i}}]`,
                                        parent
                                    )
                                )
                                .filter(isInstanceOf(ValidationErrors))
                                .forEach(innerErrors => errors.push(...innerErrors))

                            break
                        case 'primitive':
                            if (!(Generics.Primitives as readonly string[]).includes(typeof arg))
                                pushNewError({
                                    message: getValidatorMessage(
                                        schema,
                                        `Value must be a primitive`
                                    ),
                                    context: {
                                        structMetadata: metadata,
                                        expectedType: metadata.type,
                                        actualType: typeof arg,
                                    },
                                })
                            break
                        case 'enum':
                            if (metadata.types.length < 2)
                                throw new TypeError(
                                    'An enum schema must have at least two values to match'
                                )

                            if (!(Generics.Primitives as readonly string[]).includes(typeof arg))
                                pushNewError({
                                    message: getValidatorMessage(
                                        schema,
                                        `Value must be a primitive`
                                    ),
                                    context: {
                                        structMetadata: metadata,
                                        expectedType: metadata.type,
                                        actualType: typeof arg,
                                    },
                                })

                            const enumResults = metadata.types.map(enumElementStruct =>
                                validate.bind(mustNotThrow())<Generics.PrimitiveType, Name, Parent>(
                                    arg,
                                    enumElementStruct.schema,
                                    { name, parent: parent === NO_PARENT ? undefined : parent }
                                )
                            )

                            const enumErrorCount = enumResults.filter(
                                isInstanceOf(ValidationErrors)
                            ).length

                            if (enumResults.length - enumErrorCount > 1)
                                throw new TypeError('Invalid Enum State! Multiple matches found!')

                            if (enumErrorCount === enumResults.length)
                                pushNewError({
                                    message: getValidatorMessage(
                                        schema,
                                        `Value does not match any of the enum values`
                                    ),
                                    context: {
                                        structMetadata: metadata,
                                        expected: { roMatch: { xor: metadata.types } },
                                    },
                                })

                            break
                        case 'null':
                            if (arg !== null)
                                pushNewError({
                                    message: getValidatorMessage(schema, `Value must be null`),
                                    context: {
                                        structMetadata: metadata,
                                        expectedType: metadata.type,
                                        actualType: typeof arg,
                                    },
                                })

                            break
                        default:
                            if (typeof arg !== metadata.type)
                                pushNewError({
                                    message: getValidatorMessage(
                                        schema,
                                        `Value must be of type "${metadata.type}"`
                                    ),
                                    context: {
                                        structMetadata: metadata,
                                        expectedType: metadata.type,
                                        actualType: typeof arg,
                                    },
                                })
                            else if (!schema(arg))
                                pushNewError({
                                    message: getValidatorMessage(
                                        schema,
                                        `Value must pass inner schema validations "${metadata.type}"`
                                    ),
                                    context: {
                                        structMetadata: metadata,
                                        expectedType: metadata.type,
                                        actualType: typeof arg,
                                        schema,
                                    },
                                })
                    }

                    const ruleErrors = validateRules(
                        arg,
                        metadata.rules,
                        schema,
                        name,
                        parent
                    ).errors

                    errors.push(...ruleErrors)
                }
        }
    }

    if (errors.length > 0) {
        if (throws) throw new ValidationErrors(errors)

        return new ValidationErrors(errors)
    }

    return arg as T
}

type ISchemaValidator<T, Throws extends boolean = DefaultThrowsParam> = Merge<
    {},
    Throws extends true
        ? {
              validate<V>(value: V): T
          }
        : {
              validate<V>(value: V): T | ValidationErrors
          }
>

interface ISchemaValidatorConstructor {
    new <T>(schema: TypeGuard<T>): SchemaValidator<T, DefaultThrowsParam>
    new <T, Throws extends true>(schema: TypeGuard<T>, throws: Throws): SchemaValidator<T, true>
    new <T, Throws extends false>(schema: TypeGuard<T>, throws: Throws): SchemaValidator<T, false>
    new <T, Throws extends boolean>(
        schema: TypeGuard<T>,
        throws: Throws
    ): SchemaValidator<T, typeof throws>
}

type SchemaValidator<T, Throws extends boolean = DefaultThrowsParam> = ISchemaValidatorConstructor &
    ISchemaValidator<T, Throws>

const NO_ARG = Symbol('SchemaValidator::NO_ARG')

class __SchemaValidator<T, Throws extends boolean = DefaultThrowsParam> {
    public constructor(schema: TypeGuard<T>)
    public constructor(schema: TypeGuard<T>, throws: Throws)
    public constructor(
        protected schema: TypeGuard<T>,
        protected throws = defaults['throws']
    ) {}

    public static validate<T>(
        arg: unknown,
        schema: TypeGuard<T>,
        shouldThrow: boolean = defaults['throws']
    ): ValidateReturn<T> {
        return validate.bind(setThrows(shouldThrow))(arg, schema)
    }

    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>,
        schema: TypeGuard<T>
    ): TypeGuard<T>
    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>
    ): (schema: TypeGuard<T>) => TypeGuard<T>

    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>,
        schema?: TypeGuard<T> | typeof NO_ARG
    ): TypeGuard<T> | (<U = T>(schema: TypeGuard<U>) => TypeGuard<U>)
    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>,
        schema: TypeGuard<T> | typeof NO_ARG = NO_ARG
    ) {
        if (schema === NO_ARG)
            return (schema: TypeGuard<T>) => __SchemaValidator.setValidatorMessage(message, schema)

        if (typeof message === 'string') return setValidatorMessage(message, schema)
        if (typeof message === 'function')
            return setValidatorMessageFormator(message as MessageFormator, schema)

        if (!hasStructMetadata(schema))
            throw new Error(
                'Cannot set validator message mapper for non-object/array schema: missing metadata to apply'
            )

        const metadata = getStructMetadata(schema) as V3.StructType

        if (metadata.type !== 'object')
            throw new Error('Cannot set validator message mapper for non-object/array schema')

        if ('tree' in metadata) {
            if ('className' in metadata)
                throw new TypeError(
                    "Cannot set validator message mapper for class instance schema's properties"
                )

            Object.entries(message).forEach(([k, item]) =>
                __SchemaValidator.setValidatorMessage<Value<T>>(
                    item as ValidatorMessageMap<Value<T>>,
                    metadata.tree[k as keyof T].schema as TypeGuard<Value<T>>
                )
            )
        } else if ('entries' in metadata)
            __SchemaValidator.setValidatorMessage(
                message,
                (metadata.entries as GenericStruct<any>).schema
            )
        else throw new Error('Invalid metadata for object')

        return schema
    }

    public validate<V>(value: V): T | Throws extends true ? never : ValidationErrors
    public validate<V>(value: V, shouldThrow: true): T
    public validate<V>(value: V, shouldThrow: false): T | ValidationErrors
    public validate<V>(value: V, shouldThrow: boolean): T | ValidationErrors

    @AutoBind()
    public validate<V>(value: V, shouldThrow: boolean = this.throws): T | ValidationErrors {
        return validate.bind(setThrows(shouldThrow))(value, this.schema)
    }
}

export const SchemaValidator = __SchemaValidator as unknown as ISchemaValidatorConstructor & {
    validate<T>(arg: unknown, schema: TypeGuard<T>): T
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: true): T
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: false): ValidateReturn<T>
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: boolean): ValidateReturn<T>

    setValidatorMessage<T>(message: ValidatorMessageMap<T>, schema: TypeGuard<T>): TypeGuard<T>
    setValidatorMessage<T>(message: ValidatorMessageMap<T>): (schema: TypeGuard<T>) => TypeGuard<T>
}
