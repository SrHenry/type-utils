import { GetTypeGuard } from '../TypeGuards'

export * from './GetOptional'
export * from './GetRequired'

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
