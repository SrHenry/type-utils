import type { Pipable } from '../types/Pipable.ts'
import type { internal } from '../types/Pipable.ts'
import type { TapAsyncOptions } from '../types/interfaces/HasTapAsync.ts'
import type { WithTapAsync } from '../types/WithTapAsync.ts'
import { handleTapError } from '../core/handleTapError.ts'
import { asPipelinePromise } from '../core/asPipelinePromise.ts'
import { unwrap } from '../core/unwrap.ts'
import { addPipelineProps } from './addPipelineProps.ts'

export function addTapAsync<RValue>(
  rvalue: RValue | Promise<RValue>,
  getPipeFn: (rvalue: RValue) => internal.Pipe<RValue>
): WithTapAsync<typeof rvalue> {
  if (rvalue === null || rvalue === undefined) return rvalue as WithTapAsync<typeof rvalue>

  return Object.defineProperty(Object(rvalue), 'tapAsync', {
    configurable: true,
    enumerable: false,
    get: () => {
      return (
        fn: (value: Awaited<RValue>) => Promise<void> | void,
        options?: TapAsyncOptions
      ): Promise<Awaited<RValue>> & Pipable<Promise<Awaited<RValue>>> => {
          const source = rvalue instanceof Promise ? rvalue as Promise<Awaited<RValue>> : Promise.resolve(rvalue as Awaited<RValue>)
          const promise = source.then(async (value) => {
            try {
              await fn(unwrap(value))
            } catch (error) {
              handleTapError(error, options)
            }
            return value
          }) as unknown as Promise<Awaited<RValue>> & Pipable<Promise<Awaited<RValue>>>

          addPipelineProps<RValue>(asPipelinePromise(promise), getPipeFn)

          return promise
        }
    },
  })
}
