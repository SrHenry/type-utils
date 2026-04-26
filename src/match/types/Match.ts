import type { Expr } from './Expr.ts'
import type { FilterUnion } from './FilterUnion.ts'
import type { Guard } from './Guard.ts'
import type { IsExhaustive } from './IsExhaustive.ts'
import type { ExtractPattern } from './Pattern.ts'

export type ExecMatch<TExprs extends [...any[]]> = {
    exec(): TExprs[number]
}

export type Match<
    T,
    TExprs extends [...any[]] = [],
    TPatterns = never,
    HasDefault extends boolean = false,
> = BaseMatch<T, TExprs, TPatterns, HasDefault> &
    (IsExhaustive<T, TPatterns, HasDefault> extends true ? ExecMatch<TExprs> : {})

type BaseMatch<T, TExprs extends [...any[]], TPatterns, HasDefault extends boolean> = {
    with<P extends T | Guard<T, T>, TExpr = ExtractPattern<P>>(
        pattern: P,
        expression?: Expr<TExpr, ExtractPattern<P>>
    ): Match<
        FilterUnion<T, ExtractPattern<P>>,
        [...TExprs, TExpr],
        TPatterns | ExtractPattern<P>,
        HasDefault
    >
} & (HasDefault extends true
    ? {}
    : {
          default<TExpr>(
              expression: Expr<TExpr, T>
          ): Match<never, [...TExprs, TExpr], TPatterns, true>
      })
