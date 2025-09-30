import { internal } from './Pipable'

export type WithPipe<TValue> = TValue & internal.HasPipe<TValue>
