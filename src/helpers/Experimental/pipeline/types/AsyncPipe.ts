import type { Func1 } from '../../../../types/Func'
import type { Pipable } from './Pipable'

export type AsyncPipe<T> = <U>(
    this: any,
    fn: Func1<Awaited<T>, U>
) => Promise<U> & Pipable<Promise<U>>
