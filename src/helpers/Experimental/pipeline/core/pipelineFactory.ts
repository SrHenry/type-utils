import type { AsyncFunc, Func1 } from '../../../../types/Func.ts'
import type { GetAsyncPipeline } from '../types/GetAsyncPipeline.ts'
import type { GetPipeline } from '../types/GetPipeline.ts'
import type { internal } from '../types/Pipable.ts'

import { addDepipe } from '../decorators/addDepipe.ts'
import { addPipe } from '../decorators/addPipeProps.ts'
import { addPipelineProps } from '../decorators/addPipelineProps.ts'
import { addTap } from '../decorators/addTap.ts'
import { asPipelinePromise } from './asPipelinePromise.ts'
import { setPipelineMetadata } from '../metadata/setPipelineMetadata.ts'

export function getPipeFn<T>(rvalue: T): internal.Pipe<typeof rvalue>
export function getPipeFn(): internal.Pipe<void>

export function getPipeFn<T>(this: unknown, rvalue?: T): internal.Pipe<typeof rvalue> {
  return function pipe<U>(this: unknown, cb: Func1<T, U>) {
    return pipelineFactory<ReturnType<typeof cb>, T>(cb).apply(this, [rvalue!])
  }.bind(this) as internal.Pipe<typeof rvalue>
}

export function pipelineFactory(): internal.HasPipe<void>
export function pipelineFactory<RValue, Arg = never>(
  cb: Func1<Arg, RValue>
): Func1<Arg, GetPipeline<RValue>>
export function pipelineFactory<RValue, Arg = never>(
  cb: AsyncFunc<[Arg], RValue>
): Func1<Arg, GetAsyncPipeline<RValue>>

export function pipelineFactory<RValue extends {}, Arg>(
  this: any,
  cb?: Func1<Arg, RValue | Promise<RValue>>
) {
  if (!cb) return setPipelineMetadata({ pipe: getPipeFn() })

  return setPipelineMetadata(
    function (this: any, arg0: Arg) {
      let rvalue: RValue | Promise<RValue>

      if (arg0 instanceof Promise) {
        rvalue = arg0.then(r => cb.apply(this, [r]))
        addPipelineProps<RValue>(asPipelinePromise(rvalue), getPipeFn)
      } else {
        if (typeof cb.apply !== 'function') {
          if (process.env['DEBUG']) console.warn({ cb, apply: cb.apply })

          throw new TypeError('callback must be a callable function or async function')
        }

        rvalue = cb.apply(this, [arg0])
        if (rvalue === null || rvalue === undefined) return rvalue

        if (rvalue instanceof Promise) {
          addPipelineProps<RValue>(asPipelinePromise(rvalue), getPipeFn)
        } else {
          rvalue = addPipe(rvalue, getPipeFn)
          rvalue = addTap(rvalue, getPipeFn)
          rvalue = addDepipe(rvalue)
        }
      }

      return setPipelineMetadata(rvalue)
    }.bind(this)
  )
}
