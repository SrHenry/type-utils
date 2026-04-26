import { __validator_message_formator__ } from './constants.ts'
import { hasMetadata } from './hasMetadata.ts'

export function hasValidatorMessageFormator(value: unknown): boolean {
    return hasMetadata(__validator_message_formator__, value)
}
