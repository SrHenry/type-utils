import { internal } from './Pipable'

export type WithPipeAsync<TValue> = TValue & internal.HasPipeAsync<TValue>
