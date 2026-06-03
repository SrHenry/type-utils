import type { Param0 } from '../../types/Func.ts'
import type { Predicate } from '../../types/Predicate.ts'
import type { V3 } from '../../validators/schema/types/v3/index.ts'
import type { TypeGuard } from '../types/index.ts'

import { isRuleStruct } from '../../validators/schema/helpers/isRuleStruct.ts'
import { setCustomStructMetadata } from '../../validators/schema/helpers/setCustomStructMetadata.ts'
import { isUnaryFunction } from './isUnaryFunction.ts'
import { setAsTypeGuard } from './setAsTypeGuard.ts'

type OmittedKeys = 'type' | 'schema' | 'optional'
type OptionalizedKeys = 'rules'

export function asTypeGuard<T>(
    predicate: Predicate<any>,
    metadata?: Omit<V3.CustomStruct<T>, OmittedKeys | OptionalizedKeys> &
        Partial<Pick<V3.CustomStruct<T>, OptionalizedKeys>>
): TypeGuard<T>
export function asTypeGuard<P extends Predicate<any>>(
    predicate: P,
    metadata?: Omit<V3.CustomStruct<Param0<P>>, OmittedKeys | OptionalizedKeys> &
        Partial<Pick<V3.CustomStruct<Param0<P>>, OptionalizedKeys>>
): TypeGuard<Param0<P>>

export function asTypeGuard<T>(
    predicate: Predicate<unknown>,
    metadata: Omit<V3.CustomStruct<T>, OmittedKeys | OptionalizedKeys> &
        Partial<Pick<V3.CustomStruct<T>, OptionalizedKeys>> = {}
): TypeGuard<T> {
    if (!isUnaryFunction<TypeGuard>(predicate))
        throw new Error('predicate must be a unary function')

    if (
        'rules' in metadata &&
        Array.isArray(metadata.rules) &&
        !metadata.rules.every(r => isRuleStruct(r) && r.type === 'custom')
    ) {
        throw new Error(`metadata.rules must be an array of custom rule structs`)
    }

    const struct = {
        optional: false,
        rules: [],

        ...metadata,

        type: 'custom',
        schema: predicate,
    } as V3.CustomStruct<T>

    return setCustomStructMetadata<any>(struct, setAsTypeGuard(predicate))
}
