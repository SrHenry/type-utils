import { TypeGuardError } from '../TypeGuards'
import {
    ensureInterface,
    GetTypeGuard,
    isInstanceOf,
    TypeGuard,
} from '../TypeGuards/GenericTypeGuards'
import { ArrayStruct, getStructMetadata, object, optional } from './schema'
import { ValidationError } from './ValidationError'

// type Err = ValidationError<unknown, Generics.PrimitiveType>

type ValidateReturn<Arg, T> =
    | T
    | ValidationError<Arg, T>[]
    | [ValidationError<unknown, { tree: object } | { entries: any }>]

type ValidateOptionalArgs<Name extends string = string, Parent = any> = {
    name?: Name
    parent?: Parent
}

function validate<T>(arg: unknown, schema: TypeGuard<T>): ValidateReturn<typeof arg, T>
function validate<T, Name extends string = string, Parent = any>(
    arg: unknown,
    schema: TypeGuard<T>,
    options: ValidateOptionalArgs<Name, Parent>
): ValidateReturn<typeof arg, T>
function validate<T, Name extends string, Parent>(
    arg: unknown,
    schema: TypeGuard<T>,
    name: Name,
    parent: Parent
): ValidateReturn<typeof arg, T>

function validate<T, Name extends string, Parent>(
    arg: unknown,
    schema: TypeGuard<T>,
    name_or_options?: Name | ValidateOptionalArgs<Name, Parent>,
    parent?: Parent
): ValidateReturn<typeof arg, T> {
    const metadata = getStructMetadata<any>(schema)
    const errors: ValidationError<typeof arg, T>[] = []
    const name = typeof name_or_options === 'string' ? name_or_options : name_or_options?.name
    parent = parent ?? (typeof name_or_options !== 'string' ? name_or_options?.parent : void 0)

    switch (metadata.type) {
        case 'object':
            const isObject = object()
            if (!isObject(arg)) {
                return [
                    new ValidationError({
                        message: `Expected object, got ${arg}`,
                        schema,
                        value: arg,
                        name,
                        parent,
                    }),
                ]
            }

            if ('tree' in metadata) {
                const entries = Object.entries(arg)
                const { tree } = metadata

                const results = Object.entries(tree).map(
                    ([k, { schema, optional }]): [
                        typeof tree[string]['schema'],
                        (
                            | GetTypeGuard<typeof tree[string]['schema']>
                            | ValidationError<typeof arg, typeof tree[string]['schema']>
                            | ValidationError<typeof arg, typeof tree[string]['schema']>[]
                            | undefined
                        )
                    ] => {
                        if (entries.some(([key]) => key === k))
                            return [
                                schema,
                                validate(arg[k], schema, [name, k].filter(Boolean).join('.'), arg),
                            ]
                        if (optional) return [schema, void 0]

                        return [
                            schema,
                            [
                                new ValidationError({
                                    schema,
                                    value: arg[k],
                                    message: `Missing key '${k}'`,
                                    name,
                                    parent,
                                }),
                            ],
                        ]
                    }
                )

                results
                    .filter((result): result is [TypeGuard<T>, ValidationError<unknown, T>[]] => {
                        const [, item] = result
                        return (
                            Array.isArray(item) &&
                            item.every(sub => isInstanceOf(sub, ValidationError))
                        )
                    })
                    .forEach(([, e]) => errors.push(...e))
            } else if ('entries' in metadata) {
                const { entries } = metadata as ArrayStruct<any>

                if (Array.isArray(arg)) {
                    const results = arg.map((item, i) =>
                        validate(item, entries.schema, {
                            name: [name, `[${i}]`].filter(Boolean).join(''),
                            parent: arg,
                        })
                    )

                    results
                        .filter(
                            (item): item is ValidationError<unknown, T>[] =>
                                Array.isArray(item) &&
                                item.every(sub => isInstanceOf(sub, ValidationError))
                        )
                        .forEach(item => {
                            errors.push(...item)
                        })
                } else {
                    errors.push(
                        new ValidationError({
                            schema,
                            value: arg,
                            message: `Expected array, got <${arg}>${JSON.stringify(arg)}`,
                            name,
                            parent,
                        })
                    )
                }
            }
            //refactor below to ValidationError
            else
                return [
                    new ValidationError({
                        message: 'Invalid metadata for object',
                        value: metadata,
                        schema: object({
                            tree: optional().object(),
                            entries: optional().any(),
                        }),
                        name,
                        parent,
                    }),
                ]
            // const { tree } = metadata as ObjectStruct<U> | ArrayStruct<U[number]>

            return errors.length ? errors.filter(err => err !== void 0) : (arg as T)
        default:
            try {
                // console.log(name, { arg, schema })
                return ensureInterface(arg, schema)
            } catch (e) {
                if (e instanceof TypeGuardError) {
                    return [
                        new ValidationError({
                            schema,
                            value: arg,
                            message: e.message,
                            name,
                            parent,
                        }),
                    ]
                }

                throw e
            }
    }
}

export class SchemaValidator<T> {
    public constructor(protected schema: TypeGuard<T>) {}
    public static validate<T>(arg: unknown, schema: TypeGuard<T>): ValidateReturn<typeof arg, T> {
        return validate(arg, schema)
    }

    // public static assert<U>(arg: unknown, schema: TypeGuard<U>): asserts arg is U {}

    public validate<V>(value: V): T | ValidationError<unknown, unknown>[] {
        return SchemaValidator.validate(value, this.schema)
    }
}
