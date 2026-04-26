import type { TypeGuard } from '../../../TypeGuards/types/index.ts'

import { hasMetadata } from '../../../TypeGuards/helpers/index.ts'
import { __metadata__ } from './constants.ts'

export function hasStructMetadata(guard: TypeGuard): boolean {
    return hasMetadata(__metadata__, guard)
}
