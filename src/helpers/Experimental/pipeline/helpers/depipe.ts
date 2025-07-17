import type { GetPipeline } from '../types/GetPipeline'
import type { BaseAsyncPipable } from '../types/interfaces/BaseAsyncPipable'
import type { BasePipable } from '../types/interfaces/BasePipable'

import { hasPipelineMetadata } from './hasPipelineMetadata'

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
    if (!hasPipelineMetadata(arg)) return arg
    if (arg === null || arg === undefined) return <RValue>arg

    delete (arg as any)['pipe']
    delete (arg as any)['depipe']

    if (Object.hasOwn(arg, 'pipeAsync')) delete (arg as any)['pipeAsync']

    if ([String, Number, Boolean, Symbol, BigInt].some(primitive => arg instanceof primitive))
        return <RValue>arg?.valueOf()

    return <RValue>arg
}
