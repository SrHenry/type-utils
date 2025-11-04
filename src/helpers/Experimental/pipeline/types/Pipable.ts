import type { Func1 } from '../../../../types/Func'
import type { Unpipable } from './Unpipable'

import { HasDepipe } from './interfaces/HasDepipe'

export type Pipable<T> = T extends Unpipable
    ? T
    : T extends Promise<any>
    ? internal.BaseAsyncPipable<T>
    : internal.BasePipable<T>

export namespace internal {
    export type AsyncPipe<T> = <U>(
        this: any,
        fn: Func1<Awaited<T>, U>
    ) => Promise<Awaited<U>> & Pipable<Promise<Awaited<U>>>

    export interface HasPipeAsync<T> {
        readonly pipeAsync: AsyncPipe<Awaited<T>>
    }

    export interface BaseAsyncPipable<T>
        extends HasPipe<T>,
            HasPipeAsync<T>,
            HasDepipe<Promise<Awaited<T>>> {}

    export interface HasPipe<T> {
        readonly pipe: Pipe<T>
    }

    export type Pipe<T> = <U>(
        this: any,
        fn: Func1<T, U>
    ) => U extends Unpipable ? U : U & Pipable<U>

    export interface BasePipable<T> extends HasPipe<T>, HasDepipe<T> {}
}
