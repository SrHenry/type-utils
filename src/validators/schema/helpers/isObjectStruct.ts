import type { TypeGuard } from '../../../TypeGuards/types'
import type { ObjectStruct } from '../types'

import { isStruct } from './isStruct'

export function isObjectStruct(struct: unknown): struct is ObjectStruct<any>
export function isObjectStruct<T>(struct: unknown, schema: TypeGuard<T>): struct is ObjectStruct<T>

export function isObjectStruct<T>(
    struct: unknown,
    schema?: TypeGuard<T>
): struct is ObjectStruct<any> {
    if (!isStruct(struct, schema)) return false
    if (
        !('tree' in struct) ||
        !struct?.tree ||
        typeof struct.tree === 'object' ||
        !Object.values(struct.tree).every(isStruct)
    )
        return false

    return true
}
