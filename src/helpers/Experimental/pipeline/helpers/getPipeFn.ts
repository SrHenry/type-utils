import type { Func1 } from '../../../../types/Func'
import type { Pipe } from '../types/Pipe'

import { applyPipeline } from './applyPipeline'

export function getPipeFn<T>(rvalue: T): Pipe<typeof rvalue>
export function getPipeFn(): Pipe<void>

export function getPipeFn<T>(this: unknown, rvalue?: T): Pipe<typeof rvalue> {
    return function pipe<U>(this: unknown, cb: Func1<T, U>) {
        return applyPipeline(cb, rvalue, this)
    }.bind(this) as Pipe<typeof rvalue>
}
