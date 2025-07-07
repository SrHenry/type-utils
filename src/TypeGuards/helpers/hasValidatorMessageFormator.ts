import { __validator_message_formator__ } from './constants'
import { hasMetadata } from './hasMetadata'

export function hasValidatorMessageFormator(value: unknown): boolean {
    return hasMetadata(__validator_message_formator__, value)
}
