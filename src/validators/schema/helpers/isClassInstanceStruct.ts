import type { ConstructorSignature } from '../../../TypeGuards/types'
import type { V3 } from '../types'

import { isStruct } from './isStruct'

export function isClasInstanceStruct(struct: unknown): struct is V3.ClassInstanceStruct<any>
export function isClasInstanceStruct<T extends {}>(
    struct: unknown,
    _class: ConstructorSignature<T>
): struct is V3.ClassInstanceStruct<T>

export function isClasInstanceStruct<T extends {}>(
    struct: unknown,
    _class?: ConstructorSignature<T>
): struct is V3.ClassInstanceStruct<T> {
    if (!isStruct(struct)) return false

    const isTreeInStruct = 'tree' in struct && typeof struct.tree === 'object'
    const isTreeEmpty = isTreeInStruct && Object.entries(struct.tree).length === 0

    const isClassNameInStruct = 'className' in struct && typeof struct.className === 'string'

    const isConstructorInStruct =
        'constructor' in struct && typeof struct.constructor === 'function'

    const hasProvidedClassConstructor = !!_class
    const doesConstructorMatches = isConstructorInStruct && struct.constructor === _class

    if (
        !isTreeInStruct ||
        !isTreeEmpty ||
        !isClassNameInStruct ||
        !isConstructorInStruct ||
        (hasProvidedClassConstructor && !doesConstructorMatches)
    )
        return false

    return true
}
