import type { BasePipable } from './BasePipable'
import type { HasPipeAsync } from './HasPipeAsync'

export interface BaseAsyncPipable<T> extends BasePipable<T>, HasPipeAsync<T> {}
