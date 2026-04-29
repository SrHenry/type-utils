import { ThrowHelper, StandardSchemaAdapter } from '../di/tokens.ts'
import { createServiceResolver } from '../container.ts'

type StandardSchemaLike = { readonly '~standard': { validate: (value: unknown) => { success: boolean } | Promise<{ success: boolean }> } }

const _di = createServiceResolver((c) => ({
  $throw: c.resolve(ThrowHelper),
  _isStandardSchema: c.resolve(StandardSchemaAdapter).isStandardSchema as (value: unknown) => value is StandardSchemaLike,
}))

const isStandardSchema = (p: unknown): p is StandardSchemaLike => _di._isStandardSchema(p)

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
        .find(({ pattern: p }) => {
          if (typeof p === 'function') return p(value)
          if (isStandardSchema(p)) {
            const result = p['~standard'].validate(value)
            if (result instanceof Promise) {
              throw new TypeError(
                'Cannot use async Standard Schema as a match pattern'
              )
            }
            return result.success === true
          }
          return p === value
        })
        ?.expression ??
          (defaultExpr === NO_PARAM ? _di.$throw(new TypeError('No matching pattern')) : defaultExpr)

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
