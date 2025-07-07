import { MessageFormator } from '../types'
import { __validator_message_formator__ } from './constants'
import { setMetadata } from './setMetadata'

export function setValidatorMessageFormator<T, MF extends MessageFormator>(
    messageFormator: MF,
    arg: T
): T
export function setValidatorMessageFormator<T, MF extends MessageFormator>(
    messageFormator: MF,
    arg: T
): T
export function setValidatorMessageFormator<T>(messageFormator: MessageFormator, arg: T): T {
    return setMetadata(__validator_message_formator__, messageFormator, arg)
}
