import type { GetPipeline } from './GetPipeline.ts'

export type GetAsyncPipeline<T> = GetPipeline<Promise<T>>
