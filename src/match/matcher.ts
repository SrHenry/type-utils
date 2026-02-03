import { $throw } from '../helpers/throw'

const NO_PARAM = Symbol('matcher::NO_PARAM')

const noExpr = <T>(v: T) => v

export function matcher(
    patterns: [unknown, unknown][],
    value: unknown = NO_PARAM,
    defaultExpr: unknown = NO_PARAM
) {
    if (patterns.some(p => !Array.isArray(p) || p.length !== 2))
        throw new TypeError('All patterns must be a pair tuple')

    const execFn = (value: unknown) => {
        const expr =
            patterns
                .map(([pattern, expression]) => ({ pattern, expression }))
                .find(({ pattern: p }) => (typeof p === 'function' ? p(value) : p === value))
                ?.expression ??
            (defaultExpr === NO_PARAM ? $throw(new TypeError('No matching pattern')) : defaultExpr)

        return typeof expr === 'function' ? expr(value) : expr
    }

    return {
        with: (pattern: unknown, expr: unknown = noExpr) =>
            matcher([...patterns, [pattern, expr]], value, defaultExpr),
        default: (expr: unknown) => matcher(patterns, value, expr),
        exec: value === NO_PARAM ? execFn : () => execFn(value),
    }
}

matcher['NO_PARAM'] = NO_PARAM
matcher['noExpr'] = noExpr
