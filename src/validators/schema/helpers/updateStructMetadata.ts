import type { TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { V3 } from '../types/index.ts'
import { copyStructMetadata } from './copyStructMetadata.ts'

export function updateStructMetadata<T>(
    target: TypeGuard<T>,
    update: Partial<V3.GenericStruct<T>>
) {
    return copyStructMetadata(target, target, update)
}
