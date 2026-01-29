import type { TypeGuard } from '../../../TypeGuards/types'
import type { V3 } from '../types'

import { deepMerge } from '../../../helpers/deepMerge'
import { getMetadata } from '../../../TypeGuards/helpers/getMetadata'
import { setMetadata } from '../../../TypeGuards/helpers/setMetadata'
import { __metadata__ } from './constants'
import { hasStructMetadata } from './hasStructMetadata'

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
