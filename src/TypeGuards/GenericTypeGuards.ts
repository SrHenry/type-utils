import 'reflect-metadata'
import { isFunction } from '../helpers'
import { GetOptional } from '../types/GetOptional'
import { GetRequired } from '../types/GetRequired'
import { Predicate } from '../types/Predicate'
import { MessageFormator } from '../validators/rules/types'
import { TypeGuardError } from './TypeErrors'

export type ConstructorSignature<T = any> = new (...args: any[]) => T
export type TypeGuard<T = any> = (value: unknown) => value is T
export type TypeGuards<T = any> = TypeGuard<T>[]
export type GetTypeGuard<T> = T extends TypeGuard<infer U> ? U : never
export type GetTypeGuards<T extends any[]> = T extends []
    ? []
    : T extends [infer U, ...infer V]
    ? [GetTypeGuard<U>, ...GetTypeGuards<V>]
    : TypeGuard<any>[]
export type MapToTypeGuards<Types extends any[]> = Types extends []
    ? []
    : Types extends [infer T, ...infer U]
    ? [TypeGuard<T>, ...MapToTypeGuards<U>]
    : TypeGuard<any>[]

export type ResolveIfTypeGuard<T> = T extends TypeGuard<infer U> ? U : T

export type GetStringKeys<T> = {
    [K in keyof T]: K extends string ? K : never
}[keyof T]

export type RequiredKeys<T> = (keyof GetRequired<T>)[]
export type OptionalKeys<T> = (keyof GetOptional<T>)[]

export type StaticValidators<T> = {
    [P in keyof T]-?: TypeGuard<T[P]>
}

const __curry_param__ = Symbol('design:curry_param')

export function isInstanceOf<Instance, Constructor extends ConstructorSignature>(
    value: Instance,
    type: Constructor
): value is InstanceType<Constructor>
export function isInstanceOf<Constructor extends ConstructorSignature>(
    type: Constructor
): <Instance>(value: Instance) => value is InstanceType<Constructor>

export function isInstanceOf<Instance, Constructor extends ConstructorSignature>(
    value_or_type: Instance | Constructor,
    type: Constructor | symbol = __curry_param__
): (<Instance>(value: Instance) => value is InstanceType<Constructor>) | boolean {
    if (type === __curry_param__)
        return (value: unknown): value is InstanceType<Constructor> =>
            isInstanceOf(value, <Constructor>value_or_type)

    return value_or_type instanceof <Constructor>type
}

export function ensureInterface<Interface, Instance = unknown>(
    value: Instance,
    validator: TypeGuard<Interface>
): Interface
export function ensureInterface<Interface>(
    validator: TypeGuard<Interface>
): <Instance = unknown>(value: Instance) => Interface

export function ensureInterface<Interface, Instance = unknown>(
    value: Instance | ((value: unknown) => boolean),
    validator: ((value: unknown) => boolean) | symbol = __curry_param__
): Interface | ((value: Instance) => Interface) {
    if (validator === __curry_param__)
        return (_: Instance): Interface => ensureInterface(_, value as TypeGuard)

    if (!isTypeGuard(validator))
        throw new TypeGuardError(
            'Invalid validator. must be a TypeGuard (function as predicate).',
            validator,
            isTypeGuard
        )

    if (!(validator as TypeGuard<Interface>)(value)) {
        const message = `Failed while ensuring interface type constraint of ${JSON.stringify(
            value
        )} against ${hasMessage(validator) ? getMessage(validator) : JSON.stringify(validator)}`

        throw new TypeGuardError(message, value, validator)
    }

    return value
}

export function is<Interface>(value: unknown, validator: TypeGuard<Interface>): value is Interface
export function is<Interface>(
    value: unknown,
    validator: (value: unknown) => boolean
): value is Interface

export function is<Interface>(
    value: unknown,
    validator: (value: unknown) => boolean
): value is Interface {
    return validator(value)
}

export function ensureInstanceOf<Instance, Constructor extends ConstructorSignature>(
    value: Instance,
    type: Constructor
): InstanceType<Constructor>
export function ensureInstanceOf<Constructor extends ConstructorSignature>(
    type: Constructor
): <Instance>(value: Instance) => InstanceType<Constructor>

export function ensureInstanceOf<Instance, Constructor extends ConstructorSignature>(
    value: Instance | Constructor,
    type: Constructor | symbol = __curry_param__
): InstanceType<Constructor> | ((value: Instance) => InstanceType<Constructor>) {
    if (type === __curry_param__)
        return (_: Instance): InstanceType<Constructor> => ensureInstanceOf(_, <Constructor>value)

    if (!isInstanceOf(value, <Constructor>type))
        throw new TypeGuardError(
            `Value is not an instance of ${(<Constructor>type).name}`,
            value,
            type
        )

    return value
}

export function hasMetadata<K extends string | symbol, T>(key: K, from: T): boolean
export function hasMetadata<K extends string | symbol>(key: K): <T>(from: T) => boolean
export function hasMetadata<K extends string | symbol, T>(
    key: K,
    from: Object | typeof __curry_param__ = __curry_param__
): boolean | ((from: T) => boolean) {
    if (from === __curry_param__) return (from: T): boolean => hasMetadata(key, from)

    try {
        if (from === null || typeof from === 'undefined') throw new Error('Invalid target object')

        return Reflect.hasMetadata(key, from)
    } catch {
        return false
    }
}

export function imprintMetadata<U>(key: string | symbol, metadata: unknown, into: U): U
export function imprintMetadata(key: string | symbol, metadata: unknown): <U>(into: U) => U
export function imprintMetadata(key: string | symbol): {
    <U>(metadata: unknown, into: U): U
    <U>(metadata: unknown): (into: U) => U
}
// export function imprintMetadata(key: string | symbol): <U>(metadata: unknown, into: U) => U
// export function imprintMetadata(key: string | symbol): (metadata: unknown) => <U>(into: U) => U

export function imprintMetadata(
    key: string | symbol,
    metadata: unknown | symbol = __curry_param__,
    into: Object | Symbol = __curry_param__
): Object {
    if (into === __curry_param__) {
        if (metadata === __curry_param__)
            return (metadata: unknown, into: Object | symbol = __curry_param__) => {
                if (into === __curry_param__)
                    return (into: Object) => imprintMetadata(key, metadata, into)

                return imprintMetadata(key, metadata, into)
            }

        return (into: Object): Object => imprintMetadata(key, metadata, into)
    }

    try {
        Reflect.defineMetadata(key, metadata, into)
    } finally {
        return into
    }
}

export function retrieveMetadata<T extends string | symbol, U>(key: T, from: U): any | undefined
export function retrieveMetadata<T extends string | symbol, U, V extends TypeGuard>(
    key: T,
    from: U,
    schema: V
): GetTypeGuard<V> | undefined
export function retrieveMetadata<T extends string | symbol>(
    key: T
): {
    <U>(from: U): any | undefined
    <U, V extends TypeGuard>(from: U, schema: V): any | undefined
}

export function retrieveMetadata<T extends string | symbol, U, V extends TypeGuard>(
    key: T,
    from?: U,
    schema?: V
): GetTypeGuard<V> | undefined

export function retrieveMetadata(
    key: string | symbol,
    from: Object | symbol = __curry_param__,
    schema?: TypeGuard
): unknown | undefined {
    if (from === __curry_param__)
        return (from: Object, schema?: TypeGuard): unknown => retrieveMetadata(key, from, schema)

    try {
        const metadata = Reflect.getMetadata(key, from)

        if (isTypeGuard(schema) && !schema(metadata)) return void 0

        return metadata
    } catch {
        return void 0
    }
}

// Aliases
export const getMetadata = retrieveMetadata
export const setMetadata = imprintMetadata

const __message__ = Symbol('__message__')

export const hasMessage = (value: unknown) => hasMetadata(__message__, value)

export function imprintMessage(message: string): <T extends Object>(into: T) => T
export function imprintMessage<T extends Object>(message: string, into: T): T
export function imprintMessage<T extends Object>(
    message: string,
    arg: T | typeof __curry_param__ = __curry_param__
) {
    if (arg === __curry_param__) return (arg: T): T => imprintMessage(message, arg)

    return setMetadata(__message__, String(message), arg)
}

export const retrieveMessage = <T>(arg: T): string => getMetadata(__message__, arg) ?? ''

//Aliases
export const getMessage = retrieveMessage
export const setMessage = imprintMessage

const __message_formator__ = Symbol('__message_formator__')
const defaultMessageFormator = () => '' as const

export const imprintMessageFormator = <T>(formator: (...args: any[]) => string, arg: T): T =>
    setMetadata(__message_formator__, formator, arg)

export const retrieveMessageFormator = <T>(arg: T) =>
    getMetadata(__message_formator__, arg) ?? defaultMessageFormator

// Aliases
export const getMessageFormator = retrieveMessageFormator
export const setMessageFormator = imprintMessageFormator

const __validator_message__ = Symbol('__validator_message__')
const __validator_message_formator__ = Symbol('__validator_message_formator__')

export function hasValidatorMessage(value: unknown): boolean {
    return hasMetadata(__validator_message__, value)
}

export function getValidatorMessage(from: unknown): string | undefined
export function getValidatorMessage<T>(from: unknown, defaultValue: T): string | T

export function getValidatorMessage<T>(from: unknown, defaultValue?: T): string | T | undefined {
    return (
        getMetadata(
            __validator_message__,
            from,
            (arg => typeof arg === 'string') as TypeGuard<string>
        ) ?? defaultValue
    )
}
export const setValidatorMessage = <T>(message: string, arg: T): T =>
    setMetadata(__validator_message__, message, arg)

export function hasValidatorMessageFormator(value: unknown): boolean {
    return hasMetadata(__validator_message_formator__, value)
}

export function getValidatorMessageFormator(from: unknown): MessageFormator | undefined
export function getValidatorMessageFormator<T>(
    from: unknown,
    defaultFormator: T
): MessageFormator | T
export function getValidatorMessageFormator<T>(
    from: unknown,
    defaultFormator?: T
): MessageFormator | T | undefined {
    return (
        getMetadata(
            __validator_message_formator__,
            from,
            (arg => typeof arg === 'function' && arg()) as TypeGuard<MessageFormator>
        ) ?? defaultFormator
    )
}

export function setValidatorMessageFormator<T, MF extends MessageFormator>(
    messageFormator: MF,
    arg: T
): T
export function setValidatorMessageFormator<T, MF extends MessageFormator>(
    messageFormator: MF,
    arg: T
): T
export function setValidatorMessageFormator<T>(messageFormator: MessageFormator, arg: T): T {
    return setMetadata(__validator_message_formator__, messageFormator, arg)
}

export const isTypeGuard = <T = any>(value: unknown): value is TypeGuard<T> =>
    !!value && (hasTypeGuardMetadata(value) || isUnaryFunction(value))

const __type_guard__ = Symbol('__type_guard__')

export const hasTypeGuardMetadata = (value: unknown): boolean => hasMetadata(__type_guard__, value)
export const setAsTypeGuard = <T>(value: TypeGuard<T> | Predicate<T>) =>
    setMetadata(__type_guard__, true, value) as TypeGuard<T>

export const isUnaryFunction = <TFuncShape = (arg: unknown) => unknown>(
    arg: unknown
): arg is TFuncShape => isFunction(arg) && arg.length === 1
