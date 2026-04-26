import { HasDepipe } from './interfaces/HasDepipe.ts'

export type WithDepipe<TValue> = TValue & HasDepipe<TValue>
