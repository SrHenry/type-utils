import type { GetPipeline } from './GetPipeline'

export type GetAsyncPipeline<T> = GetPipeline<Promise<T>>
