import type { Pipable } from './Pipable'

export type GetPipeline<T> = T & Pipable<T>
