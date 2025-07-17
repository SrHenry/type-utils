import type { GetPipeline } from './types/GetPipeline'
import type { BaseAsyncPipable } from './types/interfaces/BaseAsyncPipable'
import type { BasePipable } from './types/interfaces/BasePipable'

export function depipe<RValue>(arg: (RValue & BasePipable<RValue>) | null): RValue | null
export function depipe<RValue>(arg: (RValue & BasePipable<RValue>) | undefined): RValue | undefined
export function depipe<RValue>(
    arg: (RValue & BasePipable<RValue>) | null | undefined
): RValue | null | undefined
export function depipe<RValue>(arg: RValue & BasePipable<RValue>): RValue

export function depipe<RValue>(arg: (RValue & BaseAsyncPipable<RValue>) | null): RValue | null
export function depipe<RValue>(
    arg: (RValue & BaseAsyncPipable<RValue>) | undefined
): RValue | undefined
export function depipe<RValue>(
    arg: (RValue & BaseAsyncPipable<RValue>) | null | undefined
): RValue | null | undefined
export function depipe<RValue>(arg: RValue & BaseAsyncPipable<RValue>): RValue

export function depipe<RValue>(arg: RValue): RValue

export function depipe<RValue>(arg: RValue | GetPipeline<RValue>): RValue {
    arg = Object.defineProperty(Object(arg), 'pipe', {
        configurable: true,
        enumerable: false,
        get: () => void 0,
    })
    arg = Object.defineProperty(Object(arg), 'pipeAsync', {
        configurable: true,
        enumerable: false,
        get: () => void 0,
    })
    arg = Object.defineProperty(Object(arg), 'depipe', {
        configurable: true,
        enumerable: false,
        get: () => void 0,
    })

    if ([String, Number, Boolean, Symbol, BigInt].some(primitive => arg instanceof primitive))
        return <RValue>arg?.valueOf()

    return <RValue>arg
}
