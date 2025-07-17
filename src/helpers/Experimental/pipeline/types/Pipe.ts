import type { Func1 } from '../../../../types/Func'
import type { Pipable } from './Pipable'
import type { Unpipable } from './Unpipable'

export type Pipe<T> = <U>(this: any, fn: Func1<T, U>) => U extends Unpipable ? U : U & Pipable<U>
