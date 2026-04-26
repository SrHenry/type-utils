import type { TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { V3 } from '../types/index.ts'

import { setMetadata } from '../../../TypeGuards/helpers/setMetadata.ts'
import { __metadata__ } from './constants.ts'

export function setCustomStructMetadata<T>(
    struct: V3.CustomStruct<T>,
    guard: TypeGuard<T>
): typeof guard {
    return setMetadata(__metadata__, struct, guard)
}
