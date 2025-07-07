import { __type_guard__ } from './constants'
import { hasMetadata } from './hasMetadata'

export const hasTypeGuardMetadata = (value: unknown): boolean => hasMetadata(__type_guard__, value)
