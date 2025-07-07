import { __validator_message__ } from './constants'
import { hasMetadata } from './hasMetadata'

export function hasValidatorMessage(value: unknown): boolean {
    return hasMetadata(__validator_message__, value)
}
