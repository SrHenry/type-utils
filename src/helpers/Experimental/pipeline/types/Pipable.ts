import type { BaseAsyncPipable } from './interfaces/BaseAsyncPipable'
import type { BasePipable } from './interfaces/BasePipable'
import type { Unpipable } from './Unpipable'

export type Pipable<T> = T extends Unpipable
    ? T
    : T extends Promise<any>
    ? BaseAsyncPipable<T>
    : BasePipable<T>
