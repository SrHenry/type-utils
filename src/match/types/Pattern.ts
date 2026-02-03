import type { Guard } from './Guard'

export type Pattern<T> = T | Guard<T, T>
export type ExtractPattern<P> = P extends Guard<infer TOut> ? TOut : P
export type ExtractExprByPattern<T, P> = T extends readonly [infer L, ...infer R]
    ? L extends readonly [infer E, infer P2]
        ? (P2 extends P ? (P extends P2 ? E : never) : never) | ExtractExprByPattern<R, P>
        : never
    : never
export type OmitUnknownPattern<T extends readonly any[]> = T extends readonly [infer L, ...infer R]
    ? L extends readonly [infer _, infer P]
        ? unknown extends P
            ? P extends unknown
                ? OmitUnknownPattern<R>
                : [L, ...OmitUnknownPattern<R>]
            : [L, ...OmitUnknownPattern<R>]
        : never
    : []
export type GroupByPattern<T extends readonly any[]> = T extends readonly [infer L, ...infer R]
    ? L extends readonly [infer E, infer P]
        ? [[E | ExtractExprByPattern<R, P>, P], ...GroupByPattern<OmitPattern<R, P>>]
        : []
    : []
export type OmitPattern<T, P> = T extends readonly [infer L, ...infer R]
    ? L extends readonly [infer _, infer P2]
        ? P2 extends P
            ? P extends P2
                ? OmitPattern<R, P>
                : [L, ...OmitPattern<R, P>]
            : [L, ...OmitPattern<R, P>]
        : never
    : []
export type ExtractSpecificPatterns<T extends readonly (readonly [any, any])[]> =
    T extends readonly [infer L, ...infer R]
        ? L extends readonly [infer _, infer P]
            ?
                  | (unknown extends P ? (P extends unknown ? never : P) : P)
                  | (R extends readonly (readonly [any, any])[]
                        ? ExtractSpecificPatterns<R>
                        : never)
            : never
        : never
