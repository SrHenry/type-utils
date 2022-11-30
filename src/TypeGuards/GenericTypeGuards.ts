import 'reflect-metadata'
import { isFunction } from '../helpers'
import { GetOptional } from '../types/GetOptional'
import { GetRequired } from '../types/GetRequired'
import { MessageFormator } from '../validators/rules/types'
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
    validator: (value: unknown) => boolean
): Interface {
    if (!(validator as TypeGuard<Interface>)(value)) {
        let message = `Failed while ensuring interface type constraint of ${JSON.stringify(
            value
        )} against ${JSON.stringify(validator)}`

        if (hasMessage(validator))
            message = `Failed while ensuring interface type constraint of ${JSON.stringify(
                value
            )} against ${getMessage(validator)}`

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

export function hasMetadata<K extends string | symbol, T>(key: K, from: T): boolean
export function hasMetadata<K extends string | symbol>(key: K, from: Object): boolean {
    try {
        return Reflect.hasMetadata(key, from)
    } catch {
        return false
    }
}

export function imprintMetadata<U>(key: string | symbol, metadata: unknown, into: U): U
export function imprintMetadata(key: string | symbol, metadata: unknown, into: Object): Object {
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
    metadataSchema: V
): GetTypeGuard<V> | undefined

export function retrieveMetadata(
    key: string | symbol,
    from: Object,
    metadataSchema?: TypeGuard
): unknown | undefined {
    try {
        const metadata = Reflect.getMetadata(key, from)

        if (isTypeGuard(metadataSchema) && !metadataSchema(metadata)) return void 0

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
export const imprintMessage = <T extends Object>(message: string, arg: T): T =>
    setMetadata(__message__, String(message), arg)

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
    isFunction(value) && typeof value(void 0) === 'boolean'
