import type { MessageFormator, TypeGuard } from '../TypeGuards/types/index.ts'
import type { Merge, Result } from '../types/index.ts'
import type { GenericStruct, V3 } from './schema/types/index.ts'
import type { ValidatorMessageMap } from './types/index.ts'

export type { ValidateReturn } from './types/ValidateReturn.ts'

import { getStructMetadata } from './schema/helpers/getStructMetadata.ts'
import { hasStructMetadata } from './schema/helpers/hasStructMetadata.ts'
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

type ValidateOptionalArgs<Name extends string = string, Parent = any> = {
    name?: Name
    parent?: Parent
}

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

function validate<T>(arg: unknown, schema: TypeGuard<T>): Result<T, ValidationErrors>
function validate<T, Name extends string = string, Parent = any>(
    arg: unknown,
    schema: TypeGuard<T>,
    options: ValidateOptionalArgs<Name, Parent>
): Result<T, ValidationErrors>
function validate<T, Name extends string, Parent>(
    arg: unknown,
    schema: TypeGuard<T>,
    name: Name,
    parent: Parent
): Result<T, ValidationErrors>

function validate<T, Name extends string, Parent>(
    arg: unknown,
    schema: TypeGuard<T>,
    name_or_options?: Name | ValidateOptionalArgs<Name, Parent>,
    parent: Parent | NO_PARENT = NO_PARENT
): Result<T, ValidationErrors> {
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
                validateObject({ ...baseCtx, metadata: metadata as V3.ObjectStruct<any> }, validate)
                break
            case 'record':
                validateRecord(
                    { ...baseCtx, metadata: metadata as V3.RecordStruct<string, any> },
                    validate
                )
                break
            case 'intersection':
                validateIntersection(
                    { ...baseCtx, metadata: metadata as V3.IntersectionStruct<any[]> },
                    validate
                )
                break
            case 'union':
                validateUnion({ ...baseCtx, metadata: metadata as V3.UnionStruct<any[]> }, validate)
                break
            default:
                validateDefault({ ...baseCtx, metadata }, validate)
        }
    }

    if (errors.length > 0) return [new ValidationErrors(errors), null]

    return [null, arg as T]
}

type ISchemaValidator<T, Throws extends boolean = true> = Merge<
    // biome-ignore lint/complexity/noBannedTypes: {} used as base type for Merge utility
    {},
    Throws extends true
        ? {
              validate<V>(value: V): T
          }
        : {
              validate<V>(value: V): Result<T, ValidationErrors>
          }
>

type ISchemaValidatorConstructor = {
    new <T>(schema: TypeGuard<T>): SchemaValidator<T, true>
    new <T, Throws extends boolean>(
        schema: TypeGuard<T>,
        throws: Throws
    ): SchemaValidator<T, Throws>
}

type SchemaValidator<T, Throws extends boolean = true> = ISchemaValidatorConstructor &
    ISchemaValidator<T, Throws>

const NO_ARG = Symbol('SchemaValidator::NO_ARG')

class __SchemaValidator<T, Throws extends boolean = true> {
    public constructor(schema: TypeGuard<T>)
    public constructor(schema: TypeGuard<T>, throws: Throws)
    public constructor(
        protected schema: TypeGuard<T>,
        // biome-ignore lint/suspicious/noShadow: constructor param shadows module-level symbol
        protected throws = true
    ) {}

    public static validate<T>(
        arg: unknown,
        schema: TypeGuard<T>,
        shouldThrow = true
    ): T | Result<T, ValidationErrors> {
        const result = validate(arg, schema)
        if (shouldThrow) {
            const [err, val] = result
            if (err) throw err
            return val as T
        }
        return result
    }

    // biome-ignore lint/suspicious/noShadow: static method T intentionally shadows class T
    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>,
        schema: TypeGuard<T>
    ): TypeGuard<T>
    // biome-ignore lint/suspicious/noShadow: static method T intentionally shadows class T
    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>
    ): (schema: TypeGuard<T>) => TypeGuard<T>

    // biome-ignore lint/suspicious/noShadow: static method T intentionally shadows class T
    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>,
        schema?: TypeGuard<T> | typeof NO_ARG
    ): TypeGuard<T> | (<U = T>(schema: TypeGuard<U>) => TypeGuard<U>)
    // biome-ignore lint/suspicious/noShadow: static method T intentionally shadows class T
    public static setValidatorMessage<T>(
        message: ValidatorMessageMap<T>,
        schema: TypeGuard<T> | typeof NO_ARG = NO_ARG
    ) {
        if (schema === NO_ARG)
            // biome-ignore lint/suspicious/noShadow: currying param intentionally shadows outer param
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

    public validate<V>(value: V): T | Result<T, ValidationErrors>
    public validate<V>(value: V, shouldThrow: true): T
    public validate<V>(value: V, shouldThrow: false): Result<T, ValidationErrors>
    public validate<V>(value: V, shouldThrow: boolean): T | Result<T, ValidationErrors>

    @AutoBind()
    // biome-ignore lint/suspicious/noShadow: callback destructuring — name matches outer scope intentionally
    public validate<V>(
        value: V,
        shouldThrow: boolean = this.throws
    ): T | Result<T, ValidationErrors> {
        const result = validate(value, this.schema)
        if (shouldThrow) {
            const [err, val] = result
            if (err) throw err
            return val as T
        }
        return result
    }
}

export const SchemaValidator = __SchemaValidator as unknown as ISchemaValidatorConstructor & {
    validate<T>(arg: unknown, schema: TypeGuard<T>): T
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: true): T
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: false): Result<T, ValidationErrors>
    validate<T>(
        arg: unknown,
        schema: TypeGuard<T>,
        shouldThrow: boolean
    ): T | Result<T, ValidationErrors>

    setValidatorMessage<T>(message: ValidatorMessageMap<T>, schema: TypeGuard<T>): TypeGuard<T>
    setValidatorMessage<T>(message: ValidatorMessageMap<T>): (schema: TypeGuard<T>) => TypeGuard<T>
}
