import type { TypeGuard } from '../../../TypeGuards/types/index.ts'

import { hasMetadata } from '../../../TypeGuards/helpers/hasMetadata.ts'
import { __metadata__ } from './constants.ts'

export function isNativeSchema<T = any>(value: unknown): value is TypeGuard<T> {
    if (value === null || value === undefined) return false
    if (typeof value !== 'function' && typeof value !== 'object') return false
    return hasMetadata(__metadata__, value as object)
}
