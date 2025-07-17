import { HasPipeAsync } from './interfaces/HasPipeAsync'

export type WithPipeAsync<TValue> = TValue & HasPipeAsync<TValue>
