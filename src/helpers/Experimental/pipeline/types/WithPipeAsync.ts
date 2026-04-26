import { internal } from './Pipable.ts'

export type WithPipeAsync<TValue> = TValue & internal.HasPipeAsync<TValue>
