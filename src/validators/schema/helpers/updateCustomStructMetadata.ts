import type { TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { V3 } from '../types/index.ts'

import { deepMerge } from '../../../helpers/deepMerge.ts'
import { getMetadata } from '../../../TypeGuards/helpers/getMetadata.ts'
import { setMetadata } from '../../../TypeGuards/helpers/setMetadata.ts'
import { __metadata__ } from './constants.ts'
import { hasStructMetadata } from './hasStructMetadata.ts'

export function updateCustomStructMetadata<T>(
    struct: Partial<V3.CustomStruct<T>>,
    guard: TypeGuard<T>
): typeof guard {
    if (!hasStructMetadata(guard))
        throw new TypeError(
            `\`guard\` parameter must have a struct metadata in order to be updated!`
        )

    return setMetadata(__metadata__, deepMerge(getMetadata(__metadata__, guard), struct), guard)
}
