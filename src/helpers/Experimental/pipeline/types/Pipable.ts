import type { Func, Func1 } from '../../../../types/Func.ts'
import type { Unpipable } from './Unpipable.ts'
import type { TapOptions } from './interfaces/HasTap.ts'
import type { TapAsyncOptions } from './interfaces/HasTapAsync.ts'

import { HasDepipe } from './interfaces/HasDepipe.ts'

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

export type Tap<T> = T extends Promise<any>
  ? (fn: (value: Awaited<T>) => void, options?: TapOptions) => Promise<Awaited<T>> & Pipable<Promise<Awaited<T>>>
  : (fn: (value: T) => void, options?: TapOptions) => T & Pipable<T>

export type TapAsync<T> = T extends Promise<any>
  ? (fn: (value: Awaited<T>) => Promise<void> | void, options?: TapAsyncOptions) => Promise<Awaited<T>> & Pipable<Promise<Awaited<T>>>
  : (fn: (value: T) => Promise<void> | void, options?: TapAsyncOptions) => Promise<T> & Pipable<Promise<T>>

export interface BaseAsyncPipable<T>
  extends HasPipe<T>,
    HasPipeAsync<T>,
    HasDepipe<Promise<Awaited<T>>> {
  readonly tap: Tap<T>
  readonly tapAsync: TapAsync<T>
}

export interface HasPipe<T> {
  readonly pipe: Pipe<T>
}

export type Pipe<T> = <U>(
  this: any,
  fn: Func1<T, U>
) => U extends Unpipable ? U : U & Pipable<U>

export type Enpipe<T extends [...any]> = <U>(
  this: any,
  fn: Func<T, U>
) => U extends Unpipable ? U : U & Pipable<U>

export interface BasePipable<T> extends HasPipe<T>, HasDepipe<T> {
  readonly tap: Tap<T>
}
}
