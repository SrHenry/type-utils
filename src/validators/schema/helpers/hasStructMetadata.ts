import type { TypeGuard } from '../../../TypeGuards/types'

import { hasMetadata } from '../../../TypeGuards/helpers'
import { __metadata__ } from './constants'

export function hasStructMetadata(guard: TypeGuard): boolean {
    return hasMetadata(__metadata__, guard)
}
