import type { GetPipeline } from './types/GetPipeline.ts'

import { pipeline } from './helpers/pipeline.ts'

export function pipe<RValue>(arg: RValue): GetPipeline<RValue> {
    return pipeline((o: RValue) => o)(arg)
}
