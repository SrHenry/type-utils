import type { Pipable } from '../types/Pipable.ts'
import type { internal } from '../types/Pipable.ts'
import type { TapOptions } from '../types/interfaces/HasTap.ts'
import type { TapAsyncOptions } from '../types/interfaces/HasTapAsync.ts'
import { handleTapError } from '../core/handleTapError.ts'
import { asPipelinePromise } from '../core/asPipelinePromise.ts'
import { unwrap } from '../core/unwrap.ts'
import { addDepipe } from './addDepipe.ts'

export function addPipelineProps<RValue>(
  promise: Promise<unknown>,
  getPipeFn: (rvalue: RValue) => internal.Pipe<RValue>
): void {
  Object.defineProperty(promise, 'pipe', {
    configurable: true,
    enumerable: false,
    get: () => getPipeFn(promise as unknown as RValue),
  })

  Object.defineProperty(promise, 'pipeAsync', {
    configurable: true,
    enumerable: false,
    get: () => getPipeFn(promise as unknown as RValue),
  })

  addDepipe(promise as Promise<RValue>)

  Object.defineProperty(promise, 'tap', {
    configurable: true,
    enumerable: false,
    get: () => (fn: (value: RValue) => void, options?: TapOptions) => {
      const next = (promise as unknown as Promise<Awaited<RValue>>).then(async (value) => {
        try {
          await fn(unwrap(value) as unknown as RValue)
        } catch (error) {
          handleTapError(error, options)
        }
        return value
      }) as unknown as RValue & Pipable<RValue>

    addPipelineProps<RValue>(asPipelinePromise(next), getPipeFn)

    return next
  },
})

Object.defineProperty(promise, 'tapAsync', {
    configurable: true,
    enumerable: false,
    get: () => (
      fn: (value: Awaited<RValue>) => Promise<void> | void,
      options?: TapAsyncOptions
    ) => {
      const next = (promise as unknown as Promise<Awaited<RValue>>).then(async (value) => {
        try {
          await fn(unwrap(value))
        } catch (error) {
          handleTapError(error, options)
        }
        return value
      }) as unknown as Promise<Awaited<RValue>> & Pipable<Promise<Awaited<RValue>>>

    addPipelineProps<RValue>(asPipelinePromise(next), getPipeFn)

    return next
    },
  })
}
