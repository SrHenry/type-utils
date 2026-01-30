import type { TypeGuard } from '../../../TypeGuards/types'
import type { V3 } from '../types'
import { copyStructMetadata } from './copyStructMetadata'

export function updateStructMetadata<T>(
    target: TypeGuard<T>,
    update: Partial<V3.GenericStruct<T>>
) {
    return copyStructMetadata(target, target, update)
}
