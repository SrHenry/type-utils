import { GetTypeGuard } from '../TypeGuards'

export * from './GetOptional'
export * from './GetRequired'
export {
    __OE_2_T as ObjectEntries,
    __E_2_T as Entries,
    __OE_1_T as ObjectEntry,
    __E_1_T as Entry,
    __OV_2_T as ObjectValues,
    __V_2_T as Values,
    __OV_1_T as ObjectValue,
    __V_1_T as Value,
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
    : MergeObjects<L, R>

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
