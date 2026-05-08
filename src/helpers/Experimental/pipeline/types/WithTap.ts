import type { HasTap } from './interfaces/HasTap.ts'

export type WithTap<TValue> = TValue & HasTap<TValue>
