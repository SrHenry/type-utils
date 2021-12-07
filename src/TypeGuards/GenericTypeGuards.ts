import { GetOptional } from '../types/GetOptional'
import { GetRequired } from '../types/GetRequired'
import { TypeGuardError } from './TypeErrors'
import util from 'util'

export type ConstructorSignature<T = any> = new (...args: any[]) => T
export type TypeGuard<T = any> = (value: unknown) => value is T
export type GetTypeGuard<T> = T extends TypeGuard<infer U> ? U : never

export type ResolveIfTypeGuard<T> = T extends TypeGuard<infer U> ? U : T

export type GetStringKeys<T> = { [K in keyof T]: K extends string ? K : never }[keyof T]

export type RequiredKeys<T> = (keyof GetRequired<T>)[]
export type OptionalKeys<T> = (keyof GetOptional<T>)[]

export type StaticValidators<T> = {
    [P in keyof T]-?: TypeGuard<T[P]>
}

export function isInstanceOf<Instance, Constructor extends ConstructorSignature>(
    value: Instance,
    type: Constructor
): value is InstanceType<Constructor> {
    return value instanceof type
}

export function ensureInterface<Interface, Instance = unknown>(
    value: Instance,
    validator: TypeGuard<Interface>
): Interface
export function ensureInterface<Interface, Instance = unknown>(
    value: Instance,
    validator: (value: unknown) => boolean
): Interface {
    if (!(validator as TypeGuard<Interface>)(value))
        throw new TypeGuardError(
            'Failed while ensuring interface type constraint',
            value,
            validator
        )

    return value
}
export declare namespace ensureInterface {
    function __promisify__<Interface, Instance = unknown>(
        value: Instance,
        validator: TypeGuard<Interface>
    ): Promise<Interface>
    function __promisify__<Interface, Instance = unknown>(
        value: Instance,
        validator: (value: unknown) => boolean
    ): Promise<Interface>
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
export declare namespace ensureInstanceOf {
    function __promisify__<Instance, Constructor extends ConstructorSignature>(
        value: Instance,
        type: Constructor
    ): Promise<InstanceType<Constructor>>
}

export namespace Promisify {
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

ensureInterface[util.promisify.custom] = Promisify.ensureInterface
ensureInstanceOf[util.promisify.custom] = Promisify.ensureInstanceOf

export const ensureInterfaceAsync = util.promisify(ensureInterface)
export const ensureInstanceOfAsync = util.promisify(ensureInstanceOf)
