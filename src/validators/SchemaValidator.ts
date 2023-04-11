import { AutoBind } from '../helpers'
import { TypeGuardError } from '../TypeGuards'
import {
    ensureInterface,
    getMessage,
    getMetadata,
    GetTypeGuard,
    getValidatorMessage,
    hasValidatorMessage,
    isInstanceOf,
    setMetadata,
    setValidatorMessage,
    setValidatorMessageFormator,
    TypeGuard,
} from '../TypeGuards/GenericTypeGuards'
import { Merge } from '../types'
import { MessageFormator } from './rules/types'
import type { ArrayStruct } from './schema'
import { getStructMetadata, object, or } from './schema'
import { hasStructMetadata } from './schema/helpers'
import { ValidationError, ValidationErrors } from './ValidationError'
import { ValidatorMessageMap } from './Validators'

// type Err = ValidationError<unknown, Generics.PrimitiveType>

type ValidateReturn<T> = T | ValidationErrors

type ValidateOptionalArgs<Name extends string = string, Parent = any> = {
    name?: Name
    parent?: Parent
}

const defaults = {
    get throws() {
        return true
    },
} as const
type DefaultThrowsParam = typeof defaults['throws']

const throws = Symbol('[@srhenry/type-utils]:/validators/SchemaValidator/__throws__')

const shouldThrow = (subject: unknown): boolean =>
    getMetadata(throws, subject, (e => typeof e === 'boolean') as TypeGuard<boolean>) ??
    defaults.throws

// const mustThrow = <T>(subject: T = {} as T) => setThrows(true, subject)
// const setDefaultThrow = <T>(subject: T = {} as T) => setThrows(defaults.throws, subject)
const mustNotThrow = <T>(subject: T = {} as T) => setThrows(false, subject)

const setThrows = <T>(value: boolean, subject: T = {} as T) => setMetadata(throws, value, subject)

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
    parent?: Parent
): ValidateReturn<T> {
    const throws = shouldThrow(this)
    const metadata = getStructMetadata<any>(schema)
    const errors: ValidationError<typeof arg, T>[] = []
    let name: Name | undefined

    if (typeof name_or_options === 'string') name = name_or_options
    else ({ name, parent } = name_or_options ?? {})

    switch (metadata.type) {
        case 'object':
            const isValidObject = (arg: unknown): arg is Record<string, any> =>
                !!arg && typeof arg === 'object'

            if (!isValidObject(arg)) {
                errors.push(
                    new ValidationError({
                        message: getMessage(schema) ?? `Expected object, got ${arg}`,
                        schema,
                        value: arg,
                        name,
                        parent,
                    })
                )

                break
            }

            if (!parent) name ??= '$' as Name

            if ('tree' in metadata) {
                const entries = Object.entries(arg)
                const { tree } = metadata

                const results = Object.entries(tree).map(
                    ([k, { schema, optional }]): [
                        typeof tree[Exclude<keyof typeof tree, symbol>]['schema'],
                        (
                            | GetTypeGuard<
                                  typeof tree[Exclude<keyof typeof tree, symbol>]['schema']
                              >
                            | ValidationError<
                                  typeof arg,
                                  typeof tree[Exclude<keyof typeof tree, symbol>]['schema']
                              >[]
                            | undefined
                        )
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
                                item.every(predicate => predicate instanceof ValidationError))
                        )
                    })
                    .forEach(([, e]) => errors.push(...e))
            } else if ('entries' in metadata) {
                const { entries, schema, optional } = metadata as ArrayStruct<any>

                if (optional && arg === void 0) break

                if (!Array.isArray(arg)) {
                    errors.push(
                        new ValidationError({
                            schema: schema as unknown as TypeGuard<T>,
                            value: arg,
                            message: `Expected array, got <${arg}>${JSON.stringify(arg)}`,
                            name,
                            parent,
                        })
                    )

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
                errors.push(
                    new ValidationError({
                        message: 'Invalid metadata for object',
                        value: metadata,
                        schema: or(
                            object({
                                tree: object(),
                            }),
                            object({
                                entries: object(),
                            })
                        ) as unknown as TypeGuard<T>,
                        name,
                        parent,
                    })
                )
            }

            break
        default:
            try {
                return ensureInterface(arg, schema)
            } catch (e) {
                if (!(e instanceof TypeGuardError)) throw e

                let { message } = e

                if (hasValidatorMessage(schema)) message = getValidatorMessage(schema)!

                errors.push(
                    new ValidationError({
                        schema,
                        value: arg,
                        message,
                        name,
                        parent,
                    })
                )
            }
    }

    if (errors.length > 0) {
        if (throws) throw new ValidationErrors(errors)

        return new ValidationErrors(errors)
    } else return arg as T
}

type ISchemaValidator<T, Throws extends boolean = DefaultThrowsParam> = Merge<
    {
        // setValidatorMessage(message: string): this
    },
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
    new <T, Throws extends boolean>(schema: TypeGuard<T>, throws: Throws): SchemaValidator<
        T,
        typeof throws
    >
}

type SchemaValidator<T, Throws extends boolean = DefaultThrowsParam> = ISchemaValidatorConstructor &
    ISchemaValidator<T, Throws>

const NO_ARG = Symbol('SchemaValidator::NO_ARG')

class __SchemaValidator<T, Throws extends boolean = DefaultThrowsParam> {
    public constructor(schema: TypeGuard<T>)
    public constructor(schema: TypeGuard<T>, throws: Throws)
    public constructor(protected schema: TypeGuard<T>, protected throws = defaults['throws']) {}

    public static validate<T>(
        arg: unknown,
        schema: TypeGuard<T>,
        shouldThrow: boolean = defaults['throws']
    ): ValidateReturn<T> {
        return validate.bind(setThrows(shouldThrow))(arg, schema)
    }

    // public static setValidatorMessage<T>(message: string, schema: TypeGuard<T>): TypeGuard<T>
    // public static setValidatorMessage<T>(
    //     message: MessageFormator,
    //     schema: TypeGuard<T>
    // ): TypeGuard<T>
    // public static setValidatorMessage<T>(
    //     message: string | MessageFormator,
    //     schema: TypeGuard<T>
    // ): TypeGuard<T>
    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>,
        schema: TypeGuard<T>
    ): TypeGuard<T>
    // public static setValidatorMessage(message: string): <T>(schema: TypeGuard<T>) => TypeGuard<T>
    // public static setValidatorMessage(
    //     message: MessageFormator
    // ): <T>(schema: TypeGuard<T>) => TypeGuard<T>
    // public static setValidatorMessage(
    //     message: string | MessageFormator
    // ): <T>(schema: TypeGuard<T>) => TypeGuard<T>
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

        const metadata = getStructMetadata(schema)

        if (metadata.type !== 'object')
            throw new Error('Cannot set validator message mapper for non-object/array schema')

        if ('tree' in metadata)
            Object.entries(message).forEach(([k, item]) =>
                __SchemaValidator.setValidatorMessage(
                    item as ValidatorMessageMap<Value<T>>,
                    metadata.tree[k as keyof T].schema
                )
            )
        else if ('entries' in metadata)
            __SchemaValidator.setValidatorMessage(message, metadata.entries.schema as TypeGuard<T>)
        else throw new Error('Invalid metadata for object')

        return schema
    }

    public validate<V>(value: V): T | Throws extends true ? never : ValidationErrors
    public validate<V>(value: V, shouldThrow: true): T
    public validate<V>(value: V, shouldThrow: false): T | ValidationErrors
    public validate<V>(value: V, shouldThrow: boolean): T | ValidationErrors

    @AutoBind
    public validate<V>(value: V, shouldThrow: boolean = this.throws): T | ValidationErrors {
        return validate.bind(setThrows(shouldThrow))(value, this.schema)
    }
}

export const SchemaValidator = __SchemaValidator as unknown as ISchemaValidatorConstructor & {
    // static methods:
    validate<T>(arg: unknown, schema: TypeGuard<T>): T
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: true): T
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: false): ValidateReturn<T>
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: boolean): ValidateReturn<T>

    // setValidatorMessage<T>(message: string, schema: TypeGuard<T>): TypeGuard<T>
    // setValidatorMessage<T>(
    //     message: MessageFormator,
    //     schema: TypeGuard<T>
    // ): TypeGuard<T>
    // setValidatorMessage<T>(
    //     message: string | MessageFormator,
    //     schema: TypeGuard<T>
    // ): TypeGuard<T>
    setValidatorMessage<T>(message: ValidatorMessageMap<T>, schema: TypeGuard<T>): TypeGuard<T>
    // setValidatorMessage(message: string): <T>(schema: TypeGuard<T>) => TypeGuard<T>
    // setValidatorMessage(
    //     message: MessageFormator
    // ): <T>(schema: TypeGuard<T>) => TypeGuard<T>
    // setValidatorMessage(
    //     message: string | MessageFormator
    // ): <T>(schema: TypeGuard<T>) => TypeGuard<T>
    setValidatorMessage<T>(message: ValidatorMessageMap<T>): (schema: TypeGuard<T>) => TypeGuard<T>
}
