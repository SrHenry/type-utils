export type Expr<T, TPattern = any> = T | ((value: TPattern) => T)
export type ExtractExpr<T> = T extends (...args: any[]) => infer R ? R : T
export type ExtractExprByPattern<T, P> = T extends readonly [infer L, ...infer R]
    ? L extends readonly [infer E, infer P2]
        ? (P2 extends P ? (P extends P2 ? E : never) : never) | ExtractExprByPattern<R, P>
        : never
    : never
export type ExtractDefaultExpr<T extends readonly any[]> = unknown extends T[number][1]
    ? T[number][0]
    : never
export type ExtractSpecificExprs<T extends readonly (readonly [any, any])[]> = T extends readonly [
    infer L,
    ...infer R,
]
    ? L extends readonly [infer E, infer P]
        ?
              | (unknown extends P ? (P extends unknown ? never : E) : E)
              | (R extends readonly (readonly [any, any])[] ? ExtractSpecificExprs<R> : never)
        : never
    : never
