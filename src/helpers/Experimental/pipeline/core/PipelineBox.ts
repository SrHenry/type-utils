import type { TapOptions } from '../types/interfaces/HasTap.ts'
import type { TapAsyncOptions } from '../types/interfaces/HasTapAsync.ts'
import { handleTapError } from './handleTapError.ts'
import { checkPipeTransform } from './pipeTransformCheck.ts'
import { isCallWithTransform } from '../callWith.ts'

export class PipelineBox<T> {
 protected constructor(protected readonly _value: T) {}

  static wrap<T>(value: Exclude<T, Promise<any>>): PipelineBox<T>
  static wrap<T>(value: Promise<T>): AsyncPipelineBox<T>
  static wrap<T>(value: T | Promise<T>): PipelineBox<T> | AsyncPipelineBox<T> {
    if (value instanceof Promise) return new AsyncPipelineBox(value as Promise<T>) as AsyncPipelineBox<T>
    if (value instanceof PipelineBox) return value as PipelineBox<T>
    if (value instanceof AsyncPipelineBox) return value as AsyncPipelineBox<T>
    return new PipelineBox(value as T) as PipelineBox<T>
  }

 static isBox(value: unknown): value is PipelineBox<unknown> | AsyncPipelineBox<unknown> {
  return value instanceof PipelineBox || value instanceof AsyncPipelineBox
 }

  pipe<U>(fn: (value: T) => Exclude<U, Promise<any>>): PipelineBox<U>
  pipe<U>(fn: (value: T) => Promise<U>): AsyncPipelineBox<U>
  pipe<U>(fn: (value: T) => U | Promise<U>): PipelineBox<U> | AsyncPipelineBox<U> {
    if (isCallWithTransform(fn)) {
      const result = (this._value as (...args: any[]) => any)(...fn.__callWithArgs)
      if (result instanceof PipelineBox || result instanceof AsyncPipelineBox) return result.depipe() as PipelineBox<U> | AsyncPipelineBox<U>
      if (result instanceof Promise) return new AsyncPipelineBox(result as Promise<U>) as AsyncPipelineBox<U>
      return new PipelineBox(result as U) as PipelineBox<U>
    }
    const result = fn(this._value)
    if (result instanceof PipelineBox || result instanceof AsyncPipelineBox) return result as PipelineBox<U> | AsyncPipelineBox<U>
    if (checkPipeTransform(result)) {
      const inner = (result as { depipe(): unknown }).depipe()
      if (inner instanceof PipelineBox || inner instanceof AsyncPipelineBox) return inner as PipelineBox<U> | AsyncPipelineBox<U>
      return new PipelineBox(inner as U) as PipelineBox<U>
    }
    if (result instanceof Promise) return new AsyncPipelineBox(result as Promise<U>) as AsyncPipelineBox<U>
    return new PipelineBox(result as U) as PipelineBox<U>
  }

 pipeAsync<U>(fn: (value: T) => U | Promise<U>): AsyncPipelineBox<U> {
  const result = fn(this._value)
  const promise = result instanceof Promise ? result : Promise.resolve(result)
  return new AsyncPipelineBox(promise as Promise<U>)
 }

 tap(fn: (value: T) => void, options?: TapOptions): PipelineBox<T> {
  try {
   fn(this._value)
  } catch (error) {
   handleTapError(error, options)
  }
  return this
 }

 tapAsync(fn: (value: T) => Promise<void> | void, options?: TapAsyncOptions): AsyncPipelineBox<T> {
  const promise = Promise.resolve(this._value).then(async (v) => {
   try {
    await fn(v)
   } catch (error) {
    handleTapError(error, options)
   }
   return v
  }) as Promise<T>
  return new AsyncPipelineBox(promise)
 }

 depipe(): T {
  return this._value
 }
}

export class AsyncPipelineBox<T> {
 private readonly _promise: Promise<T>

 constructor(promise: Promise<T>) {
  this._promise = promise
 }

  pipe<U>(fn: (value: T) => Exclude<U, Promise<any>>): AsyncPipelineBox<U>
  pipe<U>(fn: (value: T) => Promise<U>): AsyncPipelineBox<U>
  pipe<U>(fn: (value: T) => U | Promise<U>): AsyncPipelineBox<U> {
    return new AsyncPipelineBox(this._promise.then(v => {
      if (isCallWithTransform(fn)) {
        const result = (v as (...args: any[]) => any)(...fn.__callWithArgs)
        if (result instanceof PipelineBox || result instanceof AsyncPipelineBox) return result.depipe()
        return result
      }
      const result = fn(v)
    if (result instanceof PipelineBox || result instanceof AsyncPipelineBox) return result.depipe()
      if (checkPipeTransform(result)) {
        return (result as { depipe(): unknown }).depipe()
      }
    return result
  }))
 }

 pipeAsync<U>(fn: (value: T) => U | Promise<U>): AsyncPipelineBox<U> {
  return new AsyncPipelineBox(this._promise.then(fn))
 }

 tap(fn: (value: T) => void, options?: TapOptions): AsyncPipelineBox<T> {
  return new AsyncPipelineBox(this._promise.then(value => {
   try {
    fn(value)
   } catch (error) {
    handleTapError(error, options)
   }
   return value
  }))
 }

 tapAsync(fn: (value: T) => Promise<void> | void, options?: TapAsyncOptions): AsyncPipelineBox<T> {
  return new AsyncPipelineBox(this._promise.then(async (value) => {
   try {
    await fn(value)
   } catch (error) {
    handleTapError(error, options)
   }
   return value
  }))
 }

 depipe(): Promise<T> {
  return this._promise
 }
}
