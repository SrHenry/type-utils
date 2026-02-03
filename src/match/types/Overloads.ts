export type Overloads<T extends readonly (readonly [any, any])[]> = T extends readonly [
    infer L,
    ...infer R,
]
    ? L extends readonly [infer TExpr, infer TPattern]
        ? ((value: TPattern) => TExpr) &
              (R extends readonly (readonly [any, any])[] ? Overloads<R> : unknown)
        : unknown
    : unknown
