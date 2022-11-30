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
    TypeGuard,
} from '../TypeGuards/GenericTypeGuards'
import { ArrayStruct, getStructMetadata, object, optional } from './schema'
import { ValidationError, ValidationErrors } from './ValidationError'

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
    const name = typeof name_or_options === 'string' ? name_or_options : name_or_options?.name
    parent = parent ?? (typeof name_or_options !== 'string' ? name_or_options?.parent : void 0)

    switch (metadata.type) {
        case 'object':
            const isObject = object()

            if (!isObject(arg)) {
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
                                    arg[k as Exclude<keyof typeof tree, symbol>],
                                    schema,
                                    [name, k].filter(Boolean).join('.'),
                                    arg
                                ),
                            ]

                        if (optional) return [schema, void 0]

                        return [
                            schema,
                            [
                                new ValidationError({
                                    schema,
                                    value: arg[k as Exclude<keyof typeof tree, symbol>],
                                    message: `Missing key '${
                                        k as Exclude<keyof typeof tree, symbol>
                                    }'`,
                                    name,
                                    parent,
                                }),
                            ],
                        ]
                    }
                )

                results
                    .filter((result): result is [TypeGuard<T>, ValidationErrors] => {
                        const [, item] = result
                        return item instanceof ValidationErrors
                    })
                    .forEach(([, e]) => errors.push(...e))
            } else if ('entries' in metadata) {
                const { entries, schema, optional } = metadata as ArrayStruct<any>

                if (optional && arg === void 0) break

                if (Array.isArray(arg)) {
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
                            schema: schema as unknown as TypeGuard<T>,
                            value: arg,
                            message: `Expected array, got <${arg}>${JSON.stringify(arg)}`,
                            name,
                            parent,
                        })
                    )
                }
            } else {
                errors.push(
                    new ValidationError({
                        message: 'Invalid metadata for object',
                        value: metadata,
                        schema: object({
                            tree: optional().object(),
                            entries: optional().any(),
                        }) as unknown as TypeGuard<T>,
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

type ISchemaValidator<T, Throws extends boolean = DefaultThrowsParam> = Throws extends true
    ? {
          validate<V>(value: V): T
      }
    : {
          validate<V>(value: V): T | ValidationErrors
      }

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

    public validate<V>(value: V): T | Throws extends true ? never : ValidationErrors
    public validate<V>(value: V, shouldThrow: true): T
    public validate<V>(value: V, shouldThrow: false): T | ValidationErrors
    public validate<V>(value: V, shouldThrow: boolean): T | ValidationErrors

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
}
