import { Func } from '../../../../types/Func'

export namespace CurryingTools {
    /**
     * Recursively drops the first N elements from a tuple T using a counter array C.
     * This correctly calculates the "remaining" parameters of the function after currying.
     */
    type TupleTail<T extends any[], N extends number, C extends any[] = []> = C['length'] extends N
        ? T
        : T extends [any, ...infer Rest]
        ? TupleTail<Rest, N, [...C, any]>
        : []

    /**
     * Recursively converts a tuple of parameters P into a chained unary curried function.
     * E.g., [T1, T2] becomes (arg1: T1) => (arg2: T2) => R
     */
    type UnaryCurry<P extends any[], R> = P extends [infer A, ...infer B]
        ? (arg: A) => UnaryCurry<B, R>
        : R

    /**
     * Defines the final type of the curried function.
     * It first computes the remaining parameters (TupleTail) and then applies the full currying chain (UnaryCurry).
     */
    export type CurriedFunc<TFunc extends Func<any[], any>, TArgs extends any[]> = UnaryCurry<
        TupleTail<Parameters<TFunc>, TArgs['length']>,
        ReturnType<TFunc>
    >
}

export default CurryingTools
