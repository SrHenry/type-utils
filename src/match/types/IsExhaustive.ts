import type { FilterUnion } from './FilterUnion'

export type IsExhaustive<T, P, HasDefault extends boolean> = HasDefault extends true
    ? true
    : [T] extends [never]
      ? true
      : [FilterUnion<T, P>] extends [never]
        ? true
        : false
