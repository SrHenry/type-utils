import type { TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { ObjectStruct } from '../types/index.ts'

import { isStruct } from './isStruct.ts'

export function isObjectStruct(struct: unknown): struct is ObjectStruct<any>
export function isObjectStruct<T extends {}>(
    struct: unknown,
    schema: TypeGuard<T>
): struct is ObjectStruct<T>

export function isObjectStruct<T extends {}>(
    struct: unknown,
    schema?: TypeGuard<T>
): struct is ObjectStruct<T> {
    if (!isStruct(struct, schema)) return false

    const isTreeInStruct = 'tree' in struct && typeof struct.tree === 'object'
    const isClassNameInStruct = 'className' in struct && typeof struct.className === 'string'
    const isConstructorInStruct =
        'constructor' in struct && typeof struct.constructor === 'function'
    const areTreeElementsStruct = isTreeInStruct && Object.values(struct.tree).every(isStruct)

    if (!isTreeInStruct || isClassNameInStruct || isConstructorInStruct || !areTreeElementsStruct)
        return false

    return true
}
