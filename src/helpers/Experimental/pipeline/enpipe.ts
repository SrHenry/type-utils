import type { Func } from '../../../types/Func'
import type { GetPipeline } from './types'
import type { CurryingTools } from './types/CurryingTools'
import type { internal } from './types/Pipable'

import { curry } from '../curry'
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
    this: unknown,

    ..._args: [TValue | unknown, ...unknown[]]
): internal.Pipe<TValue> | GetPipeline<any> {
    const [value, ...args] = _args

    if (typeof value === 'function') {
        if (value.length !== args.length) {
            const curriedFunc = curry(value, true, args.slice(0, value.length)) //(...args.slice(0, value.length))

            args.slice(value.length).reduce<GetPipeline<Func<unknown[], any>>>(
                (_pipe, value) => _pipe.pipe(enpipe(value)),
                pipe(curriedFunc as Func<any[], any>)
            )

            return pipe(curriedFunc as Func<any[], any>).pipe(enpipe(...args.slice(value.length)))
        }

        const curriedFunc = value.apply(this, args.slice(0, value.length))

        return pipe(curriedFunc)
    }

    if (args.length === 0) return pipe(value).pipe

    return pipe((fn: Func<any[], any>) => enpipe(fn, ...[value, ...args]))
}
