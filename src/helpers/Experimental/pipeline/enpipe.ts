import type { Func } from '../../../types/Func'
import type { GetPipeline } from './types'
import type { CurryingTools } from './types/CurryingTools'
import type { internal } from './types/Pipable'

import { curry } from '../curry'
import { getParametersLength } from '../curry/helpers'
import { pipe } from './pipe'

export function enpipe<TValue extends {}>(value: TValue): internal.Pipe<TValue>

export function enpipe<TFunc extends Func<any[], any>>(fn: TFunc): GetPipeline<TFunc>

export function enpipe<TFunc extends Func<any[], any>, TArgs extends Partial<Parameters<TFunc>>>(
    fn: TFunc,
    ...args: TArgs
): GetPipeline<CurryingTools.CurriedFunc<TFunc, TArgs>>

export function enpipe<TFunc extends Func<any[], any>, TArgs extends Partial<Parameters<TFunc>>>(
    ...values: TArgs
): internal.Enpipe<TArgs>

export function enpipe<TValue extends {} | Func<any[], any>>(
    this: any,

    ..._args: [TValue | unknown, ...unknown[]]
): internal.Pipe<TValue> | GetPipeline<any> {
    if (_args.length === 0) throw new Error('enpipe expects at least one argument')

    const [value, ...args] = _args

    if (typeof value === 'function') {
        const fn = value as Func<any[], any>
        const parameterCount = getParametersLength(fn) ?? fn.length

        if (this?.__DEBUG)
            console.log('enpipe(...)   >   value is function', {
                fn: {
                    _ref: fn,
                    __length__: getParametersLength(fn),
                    length: fn.length,
                    _def: fn.toString(),
                },
                args: args,
            })

        if (parameterCount !== args.length) {
            if (parameterCount > args.length)
                return pipe(
                    curry.bind({ length: parameterCount - args.length })(
                        fn.bind(this, ...args),
                        true
                    )
                )

            return pipe(fn(...args) as Func<any[], any>) // drop extra args
        }

        if (this?.__DEBUG)
            console.warn('args.length === fn.length', {
                fn: {
                    _ref: fn,
                    __length__: getParametersLength(fn),
                    length: fn.length,
                    _def: fn.toString(),
                },
                args: args,
            })

        return pipe(fn(...args))
    }

    if (args.length === 0) return pipe(value).pipe

    if (this?.__DEBUG)
        console.log('enpipe(...)   >   value is not function', {
            value,
            args,
        })

    return pipe((fn: Func<any[], any>) => {
        if (typeof fn !== 'function') {
            return fn //discard extra args if no consumer detected
        }

        return enpipe.bind(this)(fn, value, ...args)
    })
}
