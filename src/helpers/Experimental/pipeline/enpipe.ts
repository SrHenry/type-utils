import type { Func } from '../../../types/Func.ts'
import type { CurryingTools } from './types/CurryingTools.ts'
import type { Pipe } from './types/Pipable.ts'

import { curry } from '../curry/index.ts'
import { getParametersLength } from '../curry/helpers.ts'
import { pipe } from './pipe.ts'
import { PipelineBox } from './core/PipelineBox.ts'

/**
 * @deprecated Use `pipe()` + `callWith()` / `apply()` instead.
 * `enpipe` will be removed in a future release.
 *
 * Migration:
 * - `enpipe(value)` → `pipe(value)`
 * - `.pipe(enpipe(value))` (reverse-apply) → `.pipe(callWith(value))`
 * - `enpipe(fn, ...args)` (partial application) → `apply(fn, ...args)`
 * - `enpipe(fn)` (standalone chainable) → `pipe(fn)`
 */

/** @deprecated Use pipe() + callWith() / apply() instead. */
function withDepipe<T>(transform: (incoming: unknown) => unknown, box: PipelineBox<T>): Pipe<T> {
    return Object.assign(transform, {
        depipe: () => box.depipe(),
        pipe: box.pipe.bind(box) as unknown as Pipe<T>['pipe'],
    }) as Pipe<T>
}

/** @deprecated Use pipe() + callWith() / apply() instead. */
export function enpipe<TValue extends {}>(value: TValue): Pipe<TValue>

/** @deprecated Use pipe() + callWith() / apply() instead. */
export function enpipe<TFunc extends Func<any[], any>>(fn: TFunc): Pipe<ReturnType<TFunc>>

/** @deprecated Use apply() instead. */
export function enpipe<TFunc extends Func<any[], any>, TArgs extends Partial<Parameters<TFunc>>>(
    fn: TFunc,
    ...args: TArgs
): Pipe<CurryingTools.CurriedFunc<TFunc, TArgs>>

/** @deprecated Use pipe() + callWith() / apply() instead. */
// biome-ignore lint/complexity/noBannedTypes: deprecated API, {} constraint is intentional
export function enpipe<TValue extends {} | Func<any[], any>>(
    ..._args: [TValue | unknown, ...unknown[]]
): Pipe<any> {
    if (_args.length === 0) throw new Error('enpipe expects at least one argument')

    const [value, ...args] = _args

    if (typeof value === 'function') {
        const fn = value as Func<any[], any>
        const parameterCount = getParametersLength(fn) ?? fn.length

        if (parameterCount !== args.length) {
            if (parameterCount > args.length) {
                const curried = (curry(fn, true) as CallableFunction)(...args)
                const box = pipe(curried) as PipelineBox<any>
                const boundPipe = box.pipe.bind(box) as unknown as Pipe<any>
                return withDepipe((incoming: unknown) => {
                    if (typeof incoming === 'function')
                        return boundPipe(incoming as (value: any) => unknown)
                    return (curried as CallableFunction)(incoming)
                }, box) as unknown as Pipe<TValue>
            }

            const result = fn(...args)
            if (typeof result === 'function') {
                const box = pipe(result as Func<any[], any>) as PipelineBox<any>
                const boundPipe = box.pipe.bind(box) as unknown as Pipe<any>
                return withDepipe((incoming: unknown) => {
                    if (typeof incoming === 'function')
                        return boundPipe(incoming as (value: any) => unknown)
                    return (result as CallableFunction)(incoming)
                }, box) as unknown as Pipe<TValue>
            }
            return pipe(result) as unknown as Pipe<TValue>
        }

        const result = fn(...args)
        if (typeof result === 'function') {
            const box = pipe(result as Func<any[], any>) as PipelineBox<any>
            const boundPipe = box.pipe.bind(box) as unknown as Pipe<any>
            return withDepipe((incoming: unknown) => {
                if (typeof incoming === 'function')
                    return boundPipe(incoming as (value: any) => unknown)
                return (result as CallableFunction)(incoming)
            }, box) as unknown as Pipe<TValue>
        }
        return pipe(result) as unknown as Pipe<TValue>
    }

    if (args.length === 0) {
        const box = PipelineBox.wrap(value) as PipelineBox<TValue>
        const boundPipe = box.pipe.bind(box) as unknown as Pipe<TValue>
        return withDepipe((incoming: unknown) => {
            if (typeof incoming === 'function')
                return boundPipe(incoming as (value: TValue) => unknown)
            return value
        }, box) as unknown as Pipe<TValue>
    }

    return withDepipe(
        (incoming: unknown) => {
            if (typeof incoming === 'function') {
                return enpipe(incoming as Func<any[], any>, value, ...args)
            }
            return value
        },
        PipelineBox.wrap(value) as PipelineBox<TValue>
    ) as unknown as Pipe<TValue>
}
