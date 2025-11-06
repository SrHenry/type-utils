import type { AsyncFunc, Func1 } from '../../../../types/Func'
import type { GetAsyncPipeline } from '../types/GetAsyncPipeline'
import type { GetPipeline } from '../types/GetPipeline'
import type { internal } from '../types/Pipable'
import type { WithPipe } from '../types/WithPipe'
import type { WithPipeAsync } from '../types/WithPipeAsync'

import { addDepipe } from './addDepipe'
import { setPipelineMetadata } from './setPipelineMetadata'

export function getPipeFn<T>(rvalue: T): internal.Pipe<typeof rvalue>
export function getPipeFn(): internal.Pipe<void>

export function getPipeFn<T>(this: unknown, rvalue?: T): internal.Pipe<typeof rvalue> {
    return function pipe<U>(this: unknown, cb: Func1<T, U>) {
        return applyPipeline(cb, rvalue, this)
    }.bind(this) as internal.Pipe<typeof rvalue>
}

export function addPipe<RValue>(rvalue: RValue | Promise<RValue>): WithPipe<typeof rvalue> {
    return Object.defineProperty(Object(rvalue), 'pipe', {
        configurable: true,
        enumerable: false,
        get: () => getPipeFn(rvalue),
    })
}

export function addPipeAsync<RValue>(
    rvalue: RValue | Promise<RValue>
): WithPipeAsync<typeof rvalue> {
    return Object.defineProperty(Object(rvalue), 'pipeAsync', {
        configurable: true,
        enumerable: false,
        get: () => getPipeFn(rvalue),
    })
}

export function applyPipeline<Callback extends Func1<any, any>, RValue>(
    cb: Callback,
    rvalue: RValue,
    thisObject: unknown
) {
    return pipeline<ReturnType<Callback>, RValue>(cb).apply(thisObject, [rvalue])
}

export function pipeline(): internal.HasPipe<void>
export function pipeline<RValue, Arg = never>(
    cb: Func1<Arg, RValue>
): Func1<Arg, GetPipeline<RValue>>
export function pipeline<RValue, Arg = never>(
    cb: AsyncFunc<[Arg], RValue>
): Func1<Arg, GetAsyncPipeline<RValue>>

export function pipeline<RValue extends {}, Arg>(
    this: any,
    cb?: Func1<Arg, RValue | Promise<RValue>>
) {
    if (!cb) return setPipelineMetadata({ pipe: getPipeFn() })

    return setPipelineMetadata(
        function (this: any, arg0: Arg) {
            let rvalue: RValue | Promise<RValue>

            if (arg0 instanceof Promise) {
                rvalue = arg0.then(r => cb.apply(this, [r]))
                rvalue = addPipeAsync(rvalue)
            } else {
                if (typeof cb.apply !== 'function') {
                    if (process.env['DEBUG']) console.warn({ cb, apply: cb.apply })

                    throw new TypeError('callback must be a callable function or async function')
                }

                rvalue = cb.apply(this, [arg0])
                if (rvalue === null || rvalue === undefined) return rvalue
                if (rvalue instanceof Promise) rvalue = addPipeAsync(rvalue)
            }
            rvalue = addPipe(rvalue)
            rvalue = addDepipe(rvalue)

            return setPipelineMetadata(rvalue)
        }.bind(this)
    )
}
