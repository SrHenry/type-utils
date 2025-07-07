import type { GetOptional } from '../../types/GetOptional'
import type { GetRequired } from '../../types/GetRequired'

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

export type MessageFormator = (...args: any[]) => string
