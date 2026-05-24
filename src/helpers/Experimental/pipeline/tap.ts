import type { Func1 } from '../../../types/Func.ts'
import type { TapOptions } from './types/interfaces/HasTap.ts'
import { handleTapError } from './core/handleTapError.ts'

export interface TapFn<TValue> extends Func1<TValue, TValue> {
    catch(handler: (error: unknown) => void): TapFn<TValue>
}

export function tap<TValue>(fn: (value: TValue) => void, options?: TapOptions): TapFn<TValue> {
    const createTap = (opts: TapOptions = {}): TapFn<TValue> => {
        const tapFn = ((value: TValue) => {
            try {
                fn(value)
            } catch (error) {
                handleTapError(error, opts)
            }
            return value
        }) as TapFn<TValue>

        tapFn.catch = (handler: (error: unknown) => void) => {
            if (typeof handler !== 'function')
                throw new TypeError('catch handler must be a function')
            if (handler.length !== 1)
                throw new TypeError(
                    'catch handler must be a unary function (accepts exactly 1 argument)'
                )

            return createTap({ ...opts, catch: handler })
        }

        return tapFn
    }

    return createTap(options)
}
