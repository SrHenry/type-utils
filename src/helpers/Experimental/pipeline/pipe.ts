import type { GetPipeline } from './types/GetPipeline.ts'

import { pipelineFactory } from './core/pipelineFactory.ts'

export function pipe<RValue>(arg: RValue): GetPipeline<RValue> {
  return pipelineFactory((o: RValue) => o)(arg)
}
