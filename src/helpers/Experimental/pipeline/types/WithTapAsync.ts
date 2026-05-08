import type { HasTapAsync } from './interfaces/HasTapAsync.ts'

export type WithTapAsync<TValue> = TValue & HasTapAsync<TValue>
