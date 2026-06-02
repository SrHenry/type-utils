import type { TypeGuard } from '../../../TypeGuards/types/index.ts'

import { hasMetadata } from '../../../TypeGuards/helpers/index.ts'
import { __metadata__ } from './constants.ts'

export function isNativeSchema(value: unknown): value is TypeGuard<any> {
    if (value === null || value === undefined) return false
    if (typeof value !== 'function' && typeof value !== 'object') return false
    return hasMetadata(__metadata__, value as object)
}
