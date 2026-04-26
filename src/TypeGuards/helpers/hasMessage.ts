import { __message__ } from './constants.ts'
import { hasMetadata } from './hasMetadata.ts'

export const hasMessage = (value: unknown) => hasMetadata(__message__, value)
