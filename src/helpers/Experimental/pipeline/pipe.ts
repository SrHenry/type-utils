import type { GetPipeline } from './types/GetPipeline'

import { pipeline } from './helpers/pipeline'

export function pipe<RValue>(arg: RValue): GetPipeline<RValue> {
    return pipeline((o: RValue) => o)(arg)
}
