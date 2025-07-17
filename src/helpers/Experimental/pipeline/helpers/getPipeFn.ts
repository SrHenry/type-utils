import type { Pipe } from '../types/Pipe'

import { applyPipeline } from './applyPipeline'

export function getPipeFn<T>(rvalue: T): Pipe<typeof rvalue>
export function getPipeFn(): Pipe<void>

export function getPipeFn<T>(rvalue?: T): Pipe<typeof rvalue> {
    return function pipe(this: unknown, cb) {
        return applyPipeline(cb, rvalue, this)
    } as Pipe<typeof rvalue>
}
