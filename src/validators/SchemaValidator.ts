import type { MessageFormator, TypeGuard } from '../TypeGuards/types/index.ts'
import type { Merge } from '../types/index.ts'
import type { GenericStruct, V3 } from './schema/types/index.ts'
import type { ValidatorMessageMap } from './types/index.ts'

import { asTypeGuard } from '../TypeGuards/helpers/asTypeGuard.ts'
import { getMetadata } from '../TypeGuards/helpers/getMetadata.ts'
import { getStructMetadata } from './schema/helpers/getStructMetadata.ts'
import { hasStructMetadata } from './schema/helpers/hasStructMetadata.ts'
import { setMetadata } from '../TypeGuards/helpers/setMetadata.ts'
import { setValidatorMessage } from '../TypeGuards/helpers/setValidatorMessage.ts'
import { setValidatorMessageFormator } from '../TypeGuards/helpers/setValidatorMessageFormator.ts'
import { AutoBind } from '../helpers/decorators/stage-2/AutoBind.ts'
import { ValidationError, type ValidationArgs } from './ValidationError.ts'
import { ValidationErrors } from './ValidationErrors.ts'
import {
    validateWithoutMetadata,
    validateObject,
    validateRecord,
    validateIntersection,
    validateUnion,
    validateDefault,
} from './schema/helpers/validate/index.ts'

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

const throws = Symbol.for('[@srhenry/type-utils]:/validators/SchemaValidator/__throws__')

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
    // biome-ignore lint/nursery/noShadow: callback destructuring — name matches outer scope intentionally
    const throws = shouldThrow(this)
    const metadata = getStructMetadata(schema) as V3.StructType
    const errors: ValidationError[] = []
    let name: Name | undefined
    ;({ name, parent = NO_PARENT } =
        typeof name_or_options === 'string' ? { name: name_or_options } : (name_or_options ?? {}))

    if (parent === NO_PARENT) name ??= '$' as Name

    const pushNewError = pushNewErrorFactory(errors, { schema, value: arg, name, parent })

    const baseCtx = {
        arg,
        schema,
        name,
        parent,
        errors,
        pushNewError,
    }

    if (!hasStructMetadata(schema)) {
        validateWithoutMetadata({ ...baseCtx, metadata })
    } else {
        switch (metadata.type) {
            case 'object':
                validateObject(
                    { ...baseCtx, metadata: metadata as V3.ObjectStruct<any> },
                    validate,
                    mustNotThrow()
                )
                break
            case 'record':
                validateRecord(
                    { ...baseCtx, metadata: metadata as V3.RecordStruct<string, any> },
                    validate,
                    mustNotThrow()
                )
                break
            case 'intersection':
                validateIntersection(
                    { ...baseCtx, metadata: metadata as V3.IntersectionStruct<any[]> },
                    validate,
                    mustNotThrow()
                )
                break
            case 'union':
                validateUnion(
                    { ...baseCtx, metadata: metadata as V3.UnionStruct<any[]> },
                    validate,
                    mustNotThrow()
                )
                break
            default:
                validateDefault({ ...baseCtx, metadata }, validate, mustNotThrow())
        }
    }

    if (errors.length > 0) {
        if (throws) throw new ValidationErrors(errors)

        return new ValidationErrors(errors)
    }

    return arg as T
}

type ISchemaValidator<T, Throws extends boolean = DefaultThrowsParam> = Merge<
    // biome-ignore lint/complexity/noBannedTypes: {} used as base type for Merge utility
    {},
    Throws extends true
        ? {
              validate<V>(value: V): T
          }
        : {
              validate<V>(value: V): T | ValidationErrors
          }
>

type ISchemaValidatorConstructor = {
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
        // biome-ignore lint/nursery/noShadow: constructor param shadows module-level symbol
        protected throws = defaults['throws']
    ) {}

    // biome-ignore lint/nursery/noShadow: static method T intentionally shadows class T
    public static validate<T>(
        arg: unknown,
        schema: TypeGuard<T>,
        // biome-ignore lint/nursery/noShadow: param shadows module-level function
        shouldThrow: boolean = defaults['throws']
    ): ValidateReturn<T> {
        return validate.bind(setThrows(shouldThrow))(arg, schema)
    }

    // biome-ignore lint/nursery/noShadow: static method T intentionally shadows class T
    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>,
        schema: TypeGuard<T>
    ): TypeGuard<T>
    // biome-ignore lint/nursery/noShadow: static method T intentionally shadows class T
    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>
    ): (schema: TypeGuard<T>) => TypeGuard<T>

    // biome-ignore lint/nursery/noShadow: static method T intentionally shadows class T
    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>,
        schema?: TypeGuard<T> | typeof NO_ARG
    ): TypeGuard<T> | (<U = T>(schema: TypeGuard<U>) => TypeGuard<U>)
    // biome-ignore lint/nursery/noShadow: static method T intentionally shadows class T
    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>,
        schema: TypeGuard<T> | typeof NO_ARG = NO_ARG
    ) {
        if (schema === NO_ARG)
            // biome-ignore lint/nursery/noShadow: currying param intentionally shadows outer param
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

            Object.entries(message).forEach(([k, item]) => {
                __SchemaValidator.setValidatorMessage<Value<T>>(
                    item as ValidatorMessageMap<Value<T>>,
                    metadata.tree[k as keyof T].schema as TypeGuard<Value<T>>
                )
            })
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
    // biome-ignore lint/nursery/noShadow: callback destructuring — name matches outer scope intentionally
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
