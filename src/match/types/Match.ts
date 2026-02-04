import type { Expr } from './Expr'
import type { FilterUnion } from './FilterUnion'
import type { Guard } from './Guard'
import type { IsExhaustive } from './IsExhaustive'
import type { ExtractPattern } from './Pattern'

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
        // [...TExprs, ExtractExpr<TExpr>],
        [...TExprs, TExpr],
        TPatterns | ExtractPattern<P>,
        HasDefault
    >
} & (HasDefault extends true
    ? {}
    : {
          //   default<TExpr>(
          //       expression: Expr<TExpr, T>
          //   ): Match<never, [...TExprs, ExtractExpr<TExpr>], TPatterns, true>
          default<TExpr>(
              expression: Expr<TExpr, T>
          ): Match<never, [...TExprs, TExpr], TPatterns, true>
      })
