import { deepMerge } from '../../../helpers/deepMerge.ts'
import type { TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { V3 } from '../types/index.ts'

import { getStructMetadata } from './getStructMetadata.ts'
import { hasStructMetadata } from './hasStructMetadata.ts'
import { setStructMetadata } from './setStructMetadata.ts'

export function copyStructMetadata<T, Target>(source: TypeGuard<T>, target: Target): Target
export function copyStructMetadata<Target>(
    source: TypeGuard<any>,
    target: Target,
    update: Partial<V3.AnyStruct>
): Target
// export function copyStructMetadata<T, Target>(
//     source: TypeGuard<T>,
//     target: Target,
//     update: Partial<V3.CustomStruct<T>>
// ): Target
export function copyStructMetadata<T, Target>(
    source: TypeGuard<T>,
    target: Target,
    update: Partial<V3.GenericStruct<T>>
): Target

export function copyStructMetadata<T, Target>(
    source: TypeGuard<T>,
    target: Target,
    update: Partial<V3.GenericStruct<T>> = {}
) {
    if (!hasStructMetadata(source)) {
        throw new TypeError(
            `\`source\` parameter must have a struct metadata in order to be copied!`
        )
    }

    const metadata = deepMerge(getStructMetadata(source), update)

    return setStructMetadata(metadata as V3.AnyStruct, target as TypeGuard<T>) as Target
}
