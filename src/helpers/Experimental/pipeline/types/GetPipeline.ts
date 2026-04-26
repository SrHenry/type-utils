import type { Pipable } from './Pipable.ts'

export type GetPipeline<T> = T & Pipable<T>
