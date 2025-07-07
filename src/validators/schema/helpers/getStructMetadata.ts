import type { TypeGuard } from '../../../TypeGuards/types'
import type { V3 } from '../types'

import { getMetadata } from '../../../TypeGuards/helpers/getMetadata'
import { __metadata__ } from './constants'

export function getStructMetadata<U>(guard: TypeGuard<U>): V3.GenericStruct<U> | V3.AnyStruct {
    return (
        getMetadata(__metadata__, guard) ?? {
            type: 'any',
            optional: false,
            schema: guard,
        }
    )
}
