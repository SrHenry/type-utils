import type { AsyncFunc, Func1 } from '../../../../types/Func'
import { GetAsyncPipeline } from '../types/GetAsyncPipeline'
import { GetPipeline } from '../types/GetPipeline'
import type { HasPipe } from '../types/interfaces/HasPipe'
import { addDepipe } from './addDepipe'
import { addPipe } from './addPipe'
import { addPipeAsync } from './addPipeAsync'
import { getPipeFn } from './getPipeFn'

/// TODO!: implement pipeline metadata to recognize if a given value is managed by this pipeline feature

export function pipeline(): HasPipe<void>
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
    if (!cb) return { pipe: getPipeFn() }

    return function (this: any, arg0: Arg) {
        let rvalue: RValue | Promise<RValue>

        if (arg0 instanceof Promise) {
            rvalue = arg0.then(r => cb.apply(this, [r]))
            rvalue = addPipeAsync(rvalue)
        } else {
            rvalue = cb.apply(this, [arg0])
            if (rvalue === null || rvalue === undefined) return rvalue
            if (rvalue instanceof Promise) rvalue = addPipeAsync(rvalue)
        }
        rvalue = addPipe(rvalue)
        rvalue = addDepipe(rvalue)

        return rvalue
    }.bind(this)
}
