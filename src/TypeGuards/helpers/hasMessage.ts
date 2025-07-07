import { __message__ } from './constants'
import { hasMetadata } from './hasMetadata'

export const hasMessage = (value: unknown) => hasMetadata(__message__, value)
