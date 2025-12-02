import type { TypeGuard } from '../../../TypeGuards/types'
import type { V3 } from '../types'

import { getStructMetadata } from './getStructMetadata'
import { setStructMetadata } from './setStructMetadata'

export function copyStructMetadata<T, Target>(source: TypeGuard<T>, target: Target) {
    return setStructMetadata(
        getStructMetadata(source) as V3.AnyStruct,
        target as TypeGuard<T>
    ) as Target
}
