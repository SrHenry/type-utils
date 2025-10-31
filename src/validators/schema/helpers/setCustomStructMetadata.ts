import type { TypeGuard } from '../../../TypeGuards/types'
import type { V3 } from '../types'

import { setMetadata } from '../../../TypeGuards/helpers/setMetadata'
import { __metadata__ } from './constants'

export function setCustomStructMetadata<T>(
    struct: V3.CustomStruct<T>,
    guard: TypeGuard<T>
): typeof guard {
    return setMetadata(__metadata__, struct, guard)
}
