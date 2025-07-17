import { HasPipe } from './interfaces/HasPipe'

export type WithPipe<TValue> = TValue & HasPipe<TValue>
