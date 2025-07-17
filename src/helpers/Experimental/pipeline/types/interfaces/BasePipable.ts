import type { HasDepipe } from './HasDepipe'
import type { HasPipe } from './HasPipe'

export interface BasePipable<T> extends HasPipe<T>, HasDepipe<T> {}
