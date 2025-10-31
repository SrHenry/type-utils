import type { Param0 } from '../../types/Func'
import type { Predicate } from '../../types/Predicate'
import type { CustomStruct } from '../../validators/schema/types'
import type { TypeGuard } from '../types'

import { setCustomStructMetadata } from '../../validators/schema/helpers/setCustomStructMetadata'
import { isUnaryFunction } from './isUnaryFunction'
import { setAsTypeGuard } from './setAsTypeGuard'

type OmittedKeys = 'type' | 'schema' | 'optional'
export function asTypeGuard<T>(predicate: Predicate<any>): TypeGuard<T>
export function asTypeGuard<P extends Predicate<any>>(predicate: P): TypeGuard<Param0<P>>

export function asTypeGuard<T>(
    predicate: Predicate<any>,
    metadata: Omit<CustomStruct<T>, OmittedKeys>
): TypeGuard<T>
export function asTypeGuard<P extends Predicate<any>>(
    predicate: P,
    metadata: Omit<CustomStruct<Param0<P>>, OmittedKeys>
): TypeGuard<Param0<P>>

export function asTypeGuard<T>(
    predicate: Predicate<unknown>,
    metadata?: Omit<CustomStruct<T>, OmittedKeys>
): TypeGuard<T> {
    if (!isUnaryFunction<TypeGuard>(predicate))
        throw new Error('predicate must be a unary function')

    if (!metadata) return setAsTypeGuard(predicate)

    const struct = {
        optional: false,

        ...metadata,

        type: 'custom',
        schema: predicate,
    } as CustomStruct<T>

    return setCustomStructMetadata<any>(struct, setAsTypeGuard(predicate))
}
