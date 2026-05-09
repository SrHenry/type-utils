import type { PipelineBox } from '../core/PipelineBox.ts'
import type { AsyncPipelineBox } from '../core/PipelineBox.ts'
import type { Unpipable } from './Unpipable.ts'
import type { TapOptions } from './interfaces/HasTap.ts'
import type { TapAsyncOptions } from './interfaces/HasTapAsync.ts'

export type Pipable<T> = T extends Unpipable ? T : PipelineBox<T>

export type Tap<T> = T extends Promise<any>
 ? (fn: (value: Awaited<T>) => void, options?: TapOptions) => AsyncPipelineBox<Awaited<T>>
 : (fn: (value: T) => void, options?: TapOptions) => PipelineBox<T>

export type TapAsync<T> = T extends Promise<any>
 ? (fn: (value: Awaited<T>) => Promise<void> | void, options?: TapAsyncOptions) => AsyncPipelineBox<Awaited<T>>
 : (fn: (value: T) => Promise<void> | void, options?: TapAsyncOptions) => AsyncPipelineBox<T>

export type Pipe<T> = {
  <U>(fn: (value: T) => U): U extends Promise<any> ? AsyncPipelineBox<Awaited<U>> : PipelineBox<U>
  (incoming: unknown): T
  depipe(): T
  pipe: PipelineBox<T>['pipe']
}
