import type { Param0 } from '../../types/Func'
import type { Predicate } from '../../types/Predicate'
import type { TypeGuard } from '../types'

import { isUnaryFunction } from './isUnaryFunction'
import { setAsTypeGuard } from './setAsTypeGuard'

export function asTypeGuard<T>(predicate: Predicate<any>): TypeGuard<T>
export function asTypeGuard<P extends Predicate<any>>(predicate: P): TypeGuard<Param0<P>>

export function asTypeGuard<T>(predicate: Predicate<unknown>): TypeGuard<T> {
    if (!isUnaryFunction<TypeGuard>(predicate))
        throw new Error('predicate must be a unary function')

    return setAsTypeGuard(predicate)
}
