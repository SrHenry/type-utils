import { Generics } from '../Generics'
import type { GetTypeGuard } from '../TypeGuards/types'

export * from './Action'
export * from './Async'
export * from './Func'
export * from './Predicate'
export * from './Result'
export * from './Tuple'

export * from './GetOptional'
export * from './GetRequired'
export {
    __E_2_T as Entries,
    __E_1_T as Entry,
    __OE_2_T as ObjectEntries,
    __OE_1_T as ObjectEntry,
    __OV_1_T as ObjectValue,
    __OV_2_T as ObjectValues,
    __V_1_T as Value,
    __V_2_T as Values,
}

type __OE_2_T<T extends {}> = ObjectEntries<T>
type __E_2_T<T> = Entries<T>
type __OE_1_T<T extends {}> = ObjectEntry<T>
type __E_1_T<T> = Entry<T>

type __OV_2_T<T extends {}> = ObjectValues<T>
type __V_2_T<T> = Values<T>
type __OV_1_T<T extends {}> = ObjectValue<T>
type __V_1_T<T> = Value<T>

export type OptionalPropertyNames<T> = {
    [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never
}[keyof T]

export type SpreadProperties<L, R, K extends keyof L & keyof R> = {
    [P in K]: L[P] | Exclude<R[P], undefined>
}

export type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

export type MergeObjects<L, R> = Id<
    Pick<L, Exclude<keyof L, keyof R>> &
        Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>> &
        Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>> &
        SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>

export type Merge<L, R> = [L, R] extends [any, Function]
    ? R & L
    : [L, R] extends [Function, any] | [Function, Function]
    ? L & R
    : L extends Generics.PrimitiveType
    ? L & R
    : R extends Generics.PrimitiveType
    ? L & R
    : MergeObjects<L, R>

export type Merge3<A, B, C> = Merge<A, Merge<B, C>>
export type Merge4<A, B, C, D> = Merge<A, Merge3<B, C, D>>
export type Merge5<A, B, C, D, E> = Merge<A, Merge4<B, C, D, E>>
export type Merge6<A, B, C, D, E, F> = Merge<A, Merge5<B, C, D, E, F>>
export type Merge7<A, B, C, D, E, F, G> = Merge<A, Merge6<B, C, D, E, F, G>>
export type Merge8<A, B, C, D, E, F, G, H> = Merge<A, Merge7<B, C, D, E, F, G, H>>
export type Merge9<A, B, C, D, E, F, G, H, I> = Merge<A, Merge8<B, C, D, E, F, G, H, I>>
export type Merge10<A, B, C, D, E, F, G, H, I, J> = Merge<A, Merge9<B, C, D, E, F, G, H, I, J>>

export type Spread<A extends readonly [...any]> = A extends [infer L, ...infer R]
    ? MergeObjects<L, Spread<R>>
    : unknown

export type Infer<T> = GetTypeGuard<T>

export type MapFn = {
    <T, U>(value: T): U
    <T, U>(value: T, index: number): U
    <T, U>(value: T, index: number, array: T[]): U
}
export type TMapFn<T, U> = {
    (value: T): U
    (value: T, index: number): U
    (value: T, index: number, array: T[]): U
}

export type TypeFromArray<T> = T extends Array<infer U> ? U : never
