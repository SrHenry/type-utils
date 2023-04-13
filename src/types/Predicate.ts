import type { Func } from './Func'

export type Predicate<T> = Func<[value: T], boolean>
