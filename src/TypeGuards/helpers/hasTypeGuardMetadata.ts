import { __type_guard__ } from './constants.ts'
import { hasMetadata } from './hasMetadata.ts'

export const hasTypeGuardMetadata = (value: unknown): boolean => hasMetadata(__type_guard__, value)
