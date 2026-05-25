import type { Func } from '../../../../types/Func.ts'

export namespace CurryingTools {
    type TupleTail<T extends any[], N extends number, C extends any[] = []> = C['length'] extends N
        ? T
        : T extends [any, ...infer Rest]
          ? TupleTail<Rest, N, [...C, any]>
          : []

    type UnaryCurry<P extends any[], R> = P extends [infer A, ...infer B]
        ? (arg: A) => UnaryCurry<B, R>
        : R

    export type CurriedFunc<TFunc extends Func<any[], any>, TArgs extends any[]> = UnaryCurry<
        TupleTail<Parameters<TFunc>, TArgs['length']>,
        ReturnType<TFunc>
    >

    export type CurriedFirstArg<TFunc extends Func<any[], any>, TArgs extends any[]> =
        TupleTail<Parameters<TFunc>, TArgs['length']> extends [infer A, ...any[]] ? A : never

    export type CurriedReturn<TFunc extends Func<any[], any>, TArgs extends any[]> =
        CurriedFunc<TFunc, TArgs> extends (arg: any) => infer R ? R : ReturnType<TFunc>
}

export default CurryingTools
