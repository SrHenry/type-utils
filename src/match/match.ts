import type { Match } from './types/Match'
import type { MatchBuilder } from './types/MatchBuilder'

import { matcher } from './matcher'

const NO_PARAM = Symbol('match::NO_PARAM')

export function match<T = never>(): MatchBuilder<T>
export function match<T>(value: T): Match<T>

export function match(value: unknown = NO_PARAM) {
    if (value === NO_PARAM) {
        return {
            with: (pattern: unknown, expr: unknown = matcher.noExpr) => matcher([[pattern, expr]]),
            default: (expr: unknown) => matcher([], matcher.NO_PARAM, expr),
        } as unknown as MatchBuilder<any>
    }

    return {
        with: (pattern: unknown, expr: unknown = matcher.noExpr) =>
            matcher([[pattern, expr]], value),
        default: (expr: unknown) => matcher([], value, expr),
    } as unknown as Match<any>
}

match['NO_PARAM'] = NO_PARAM
