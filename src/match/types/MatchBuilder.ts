import type { Expr, ExtractDefaultExpr, ExtractSpecificExprs } from './Expr'
import type { FilterUnion } from './FilterUnion'
import type { Guard } from './Guard'
import type { IsExhaustive } from './IsExhaustive'
import type {
    ExtractPattern,
    ExtractSpecificPatterns,
    GroupByPattern,
    OmitUnknownPattern,
} from './Pattern'

import type { TupleTools } from '../../types/Tuple'

import type { Overloads } from './Overloads'

export type ExecFn<T extends readonly (readonly [any, any])[]> = Overloads<
    GroupByPattern<OmitUnknownPattern<T>>
> &
    ([ExtractDefaultExpr<T>] extends [never]
        ? unknown
        : (value: unknown) => ExtractDefaultExpr<T>) &
    ((value: ExtractSpecificPatterns<T>) => ExtractSpecificExprs<T>)

export type ExecMatchBuilder<TExprs extends [...any[]], TPatterns extends [...any[]]> = {
    exec: ExecFn<TupleTools.MergeTuples<[TExprs, TPatterns]>>
}

// type a = ExecMatchBuilder<
//     [(list: Iterable<unknown>) => unknown],
//     [[(item: unknown) => unknown]]
// >['exec']

export type BaseMatchBuilder<
    TTarget,
    TExprs extends [...any[]],
    TPatterns extends [...any[]],
    HasDefault extends boolean,
> = {
    with<
        P extends ([TTarget] extends [never] ? any : TTarget) | Guard<TTarget, TTarget>,
        TExpr = ExtractPattern<P>,
    >(
        pattern: P,
        expression?: Expr<TExpr, ExtractPattern<P>>
    ): MatchBuilder<
        FilterUnion<TTarget, ExtractPattern<P>>,
        // [...TExprs, ExtractExpr<TExpr>],
        [...TExprs, TExpr],
        [...TPatterns, ExtractPattern<P>],
        HasDefault
    >

    __exprs: [...TExprs]
    __patterns: [...TPatterns]
} & (HasDefault extends true
    ? {}
    : {
          //   default<TExpr>(
          //       expression: Expr<TExpr, TTarget>
          //   ): MatchBuilder<never, [...TExprs, ExtractExpr<TExpr>], [...TPatterns, unknown], true>
          default<TExpr>(
              expression: Expr<TExpr, TTarget>
          ): MatchBuilder<never, [...TExprs, TExpr], [...TPatterns, unknown], true>
      })
export type MatchBuilder<
    TTarget = never,
    TExprs extends [...any[]] = [],
    TPatterns extends [...any[]] = [],
    HasDefault extends boolean = false,
> = TExprs['length'] extends TPatterns['length']
    ? BaseMatchBuilder<TTarget, TExprs, TPatterns, HasDefault> &
          (IsExhaustive<TTarget, TPatterns[number], HasDefault> extends true
              ? ExecMatchBuilder<TExprs, TPatterns>
              : {})
    : never
