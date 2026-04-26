import { __validator_message__ } from './constants.ts'
import { hasMetadata } from './hasMetadata.ts'

export function hasValidatorMessage(value: unknown): boolean {
    return hasMetadata(__validator_message__, value)
}
