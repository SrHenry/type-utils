import type { Pipable } from '../types/Pipable.ts'
import type { internal } from '../types/Pipable.ts'
import type { TapOptions } from '../types/interfaces/HasTap.ts'
import type { WithTap } from '../types/WithTap.ts'
import { handleTapError } from '../core/handleTapError.ts'
import { asPipelinePromise } from '../core/asPipelinePromise.ts'
import { unwrap } from '../core/unwrap.ts'
import { addPipelineProps } from './addPipelineProps.ts'

export function addTap<RValue>(
  rvalue: RValue,
  getPipeFn: (rvalue: RValue) => internal.Pipe<RValue>
): WithTap<typeof rvalue> {
  if (rvalue === null || rvalue === undefined) return rvalue as WithTap<typeof rvalue>

  if (rvalue instanceof Promise) {
    const target = Object(rvalue)
    addPipelineProps<RValue>(asPipelinePromise(target), getPipeFn)
    return target as WithTap<typeof rvalue>
  }

  const target = Object(rvalue)
  return Object.defineProperty(target, 'tap', {
    configurable: true,
    enumerable: false,
    get: () => (fn: (value: RValue) => void, options?: TapOptions): RValue & Pipable<RValue> => {
      try {
        fn(unwrap(rvalue))
      } catch (error) {
        handleTapError(error, options)
      }
      return target as RValue & Pipable<RValue>
    },
  })
}
