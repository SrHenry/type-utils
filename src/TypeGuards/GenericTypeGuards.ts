import { isFunction } from '../helpers'
import { GetOptional } from '../types/GetOptional'
import { GetRequired } from '../types/GetRequired'
import { TypeGuardError } from './TypeErrors'

export type ConstructorSignature<T = any> = new (...args: any[]) => T
export type TypeGuard<T = any> = (value: unknown) => value is T
export type GetTypeGuard<T> = T extends TypeGuard<infer U> ? U : never

export type ResolveIfTypeGuard<T> = T extends TypeGuard<infer U> ? U : T

export type GetStringKeys<T> = {
    [K in keyof T]: K extends string ? K : never
}[keyof T]

export type RequiredKeys<T> = (keyof GetRequired<T>)[]
export type OptionalKeys<T> = (keyof GetOptional<T>)[]

export type StaticValidators<T> = {
    [P in keyof T]-?: TypeGuard<T[P]>
}

export function isInstanceOf<Constructor extends ConstructorSignature>(
    type: Constructor
): <Instance>(value: Instance) => value is InstanceType<Constructor>
export function isInstanceOf<Instance, Constructor extends ConstructorSignature>(
    value: Instance,
    type: Constructor
): value is InstanceType<Constructor>

export function isInstanceOf<Instance, Constructor extends ConstructorSignature>(
    value_or_type: Instance | Constructor,
    type?: Constructor
): (<Instance>(value: Instance) => value is InstanceType<Constructor>) | boolean {
    if (type) return value_or_type instanceof type

    return (value: unknown): value is InstanceType<Constructor> =>
        value instanceof (value_or_type as Constructor)
}

export function ensureInterface<Interface, Instance = unknown>(
    value: Instance,
    validator: TypeGuard<Interface>
): Interface
export function ensureInterface<Interface, Instance = unknown>(
    value: Instance,
    validator: ((value: unknown) => boolean) & { __message__?: string }
): Interface {
    if (!(validator as TypeGuard<Interface>)(value)) {
        let message = `Failed while ensuring interface type constraint of ${JSON.stringify(
            value
        )} against ${JSON.stringify(validator)}`
        if ('__message__' in validator)
            message = `Failed while ensuring interface type constraint of ${JSON.stringify(
                value
            )} against ${JSON.stringify(validator['__message__'])}`

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
): InstanceType<Constructor> {
    if (!isInstanceOf(value, type))
        throw new TypeGuardError(`Value is not an instance of ${type.name}`, value, type)
    return value
}

namespace Promisify {
    export async function ensureInterface<Interface, Instance = unknown>(
        value: Instance,
        validator: TypeGuard<Interface>
    ): Promise<Interface>
    export async function ensureInterface<Interface, Instance = unknown>(
        value: Instance,
        validator: (value: unknown) => boolean
    ): Promise<Interface>

    export async function ensureInterface<Interface, Instance = unknown>(
        value: Instance,
        validator: (value: unknown) => boolean | Promise<boolean>
    ): Promise<Interface> {
        if (!(validator as TypeGuard<Interface>)(value))
            throw new TypeGuardError(
                'Failed while ensuring interface type constraint',
                value,
                validator
            )

        return value
    }

    export async function ensureInstanceOf<Instance, Constructor extends ConstructorSignature>(
        value: Instance,
        type: Constructor
    ): Promise<InstanceType<Constructor>> {
        if (!isInstanceOf(value, type))
            throw new TypeGuardError(`Value is not an instance of ${type.name}`, value, type)
        return value
    }
}

export const ensureInterfaceAsync = Promisify.ensureInterface
export const ensureInstanceOfAsync = Promisify.ensureInstanceOf

export const hasMetadata = <K extends string | symbol, T = unknown>(
    key: K,
    from: T
): from is T & Record<K, unknown> => {
    //@ts-ignore
    return key in from && from[key] !== void 0 && from[key] !== null
}

export const imprintMetadata = <T, U>(key: string | symbol, metadata: T, into: U): U => {
    return Object.assign(into, { [key]: metadata })
}

export function retrieveMetadata<T extends string | symbol, U>(key: T, from: U): any | undefined
export function retrieveMetadata<T extends string | symbol, U, V extends TypeGuard>(
    key: T,
    from: U,
    metadataSchema: V
): GetTypeGuard<V> | undefined

export function retrieveMetadata<T, U extends string | symbol, V extends TypeGuard>(
    key: U,
    from: T,
    metadataSchema?: V
): GetTypeGuard<V> | (T & Record<U, unknown>) | undefined {
    const guard = (arg: any): arg is { [K in U]: GetTypeGuard<V> } =>
        hasMetadata(key, arg) && (metadataSchema?.(arg[key]) ?? true)

    try {
        const { [key]: __metadata__ } = ensureInterface(from, guard)
        return __metadata__
    } catch {
        return void 0
    }
}

// Aliases
export const getMetadata = retrieveMetadata
export const setMetadata = imprintMetadata

export const imprintMessage = <T>(message: string, arg: T): T => {
    return Object.assign(arg, { __message__: message })
}
export const retrieveMessage = <T>(arg: T): string => {
    const hasMessage = (arg: any): arg is { __message__?: string } =>
        arg && '__message__' in arg && typeof arg['__message__'] === 'string'

    try {
        const { __message__ } = ensureInterface(arg, hasMessage)
        return String(__message__)
    } catch {
        return ''
    }
}

//Aliases
export const getMessage = retrieveMessage
export const setMessage = imprintMessage

export const imprintMessageFormator = <T>(formator: (...args: any[]) => string, arg: T): T => {
    return Object.assign(arg, { __message_formator__: formator })
}
export const retrieveMessageFormator = <T>(arg: T) => {
    const hasMessageFormator = (
        arg: any
    ): arg is { __message_formator__?(...args: any[]): string } =>
        arg && '__message_formator__' in arg && typeof arg['__message_formator__'] === 'function'

    try {
        const { __message_formator__ } = ensureInterface(arg, hasMessageFormator)
        return __message_formator__ ?? (() => '')
    } catch {
        return () => ''
    }
}

// Aliases
export const getMessageFormator = retrieveMessageFormator
export const setMessageFormator = imprintMessageFormator

export const isTypeGuard = <T = any>(value: unknown): value is TypeGuard<T> =>
    isFunction(value) && typeof value(void 0) === 'boolean'
