import { MessageFormator, TypeGuard } from '../types'
import { __validator_message_formator__ } from './constants'
import { getMetadata } from './getMetadata'

export function getValidatorMessageFormator(from: unknown): MessageFormator | undefined
export function getValidatorMessageFormator<T>(
    from: unknown,
    defaultFormator: T
): MessageFormator | T
export function getValidatorMessageFormator<T>(
    from: unknown,
    defaultFormator?: T
): MessageFormator | T | undefined {
    return (
        getMetadata(
            __validator_message_formator__,
            from,
            (arg => typeof arg === 'function' && arg()) as TypeGuard<MessageFormator>
        ) ?? defaultFormator
    )
}
