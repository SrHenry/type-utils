import type { Func1 } from '../../../../types/Func'
import type { internal } from '../types/Pipable'

import { applyPipeline } from './applyPipeline'

export function getPipeFn<T>(rvalue: T): internal.Pipe<typeof rvalue>
export function getPipeFn(): internal.Pipe<void>

export function getPipeFn<T>(this: unknown, rvalue?: T): internal.Pipe<typeof rvalue> {
    return function pipe<U>(this: unknown, cb: Func1<T, U>) {
        return applyPipeline(cb, rvalue, this)
    }.bind(this) as internal.Pipe<typeof rvalue>
}
