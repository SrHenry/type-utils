import type { AsyncFunc } from '../../../types/Func.ts'
import type { TapAsyncOptions } from './types/interfaces/HasTapAsync.ts'
import { handleTapError } from './core/handleTapError.ts'

export interface TapAsyncFn<TValue> extends AsyncFunc<[TValue], TValue> {
  catch(handler: (error: unknown) => void): TapAsyncFn<TValue>
}

export function tapAsync<TValue>(fn: (value: TValue) => Promise<void> | void, options?: TapAsyncOptions): TapAsyncFn<TValue> {
  const createTapAsync = (opts: TapAsyncOptions = {}): TapAsyncFn<TValue> => {
    const tapAsyncFn = (async (value: TValue) => {
      try {
        await fn(value)
      } catch (error) {
        handleTapError(error, opts)
      }
      return value
    }) as unknown as TapAsyncFn<TValue>

    tapAsyncFn.catch = (handler: (error: unknown) => void) => {
      if (typeof handler !== 'function') throw new TypeError('catch handler must be a function')
      if (handler.length !== 1)
        throw new TypeError('catch handler must be a unary function (accepts exactly 1 argument)')

      return createTapAsync({ ...opts, catch: handler })
    }

    return tapAsyncFn
  }

  return createTapAsync(options)
}
