import type { ConstructorSignature } from '../../../TypeGuards/types/index.ts'
import type { V3 } from '../types/index.ts'

import { isStruct } from './isStruct.ts'

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
