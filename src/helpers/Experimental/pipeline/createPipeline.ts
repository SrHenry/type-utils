import type { Func1 } from '../../../types/Func'
import type { GetPipeline } from './types'
import type { internal } from './types/Pipable'

import { pipeline } from './helpers/pipeline'

export function createPipeline(): internal.HasPipe<void>
export function createPipeline<T extends Func1<any, any>>(cb: T): GetPipeline<typeof cb>

export function createPipeline(this: unknown, ...args: [Func1<any, any>?, ...any]) {
    if (args.length === 0) return pipeline()

    const [cb] = args

    return pipeline((o: Func1<unknown, unknown>) => o)(cb!)
}
