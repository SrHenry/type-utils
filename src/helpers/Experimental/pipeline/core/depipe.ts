import type { GetPipeline } from '../types/GetPipeline.ts'
import type { internal } from '../types/Pipable.ts'

import { PIPELINE_PROP_KEYS, type PipelinePropKey } from './constants.ts'
import { hasPipelineMetadata } from '../metadata/hasPipelineMetadata.ts'
import { unwrap } from './unwrap.ts'

export function depipe<RValue>(arg: (RValue & internal.BasePipable<RValue>) | null): RValue | null
export function depipe<RValue>(
  arg: (RValue & internal.BasePipable<RValue>) | undefined
): RValue | undefined
export function depipe<RValue>(
  arg: (RValue & internal.BasePipable<RValue>) | null | undefined
): RValue | null | undefined
export function depipe<RValue>(arg: RValue & internal.BasePipable<RValue>): RValue

export function depipe<RValue>(arg: (RValue & internal.BaseAsyncPipable<RValue>) | null): RValue | null
export function depipe<RValue>(
  arg: (RValue & internal.BaseAsyncPipable<RValue>) | undefined
): RValue | undefined
export function depipe<RValue>(
  arg: (RValue & internal.BaseAsyncPipable<RValue>) | null | undefined
): RValue | null | undefined
export function depipe<RValue>(arg: RValue & internal.BaseAsyncPipable<RValue>): RValue

export function depipe<RValue>(arg: RValue): RValue

export function depipe<RValue>(arg: RValue | GetPipeline<RValue>): RValue {
  if (!hasPipelineMetadata(arg)) return arg
  if (arg === null || arg === undefined) return <RValue>arg

const record = arg as Record<PipelinePropKey, unknown>
for (const key of PIPELINE_PROP_KEYS) delete record[key]

  return unwrap(arg)
}
