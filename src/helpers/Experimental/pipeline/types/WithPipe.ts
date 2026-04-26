import { internal } from './Pipable.ts'

export type WithPipe<TValue> = TValue & internal.HasPipe<TValue>
