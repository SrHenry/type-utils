import { HasDepipe } from './interfaces/HasDepipe'

export type WithDepipe<TValue> = TValue & HasDepipe<TValue>
