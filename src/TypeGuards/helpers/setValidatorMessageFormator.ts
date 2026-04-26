import { MessageFormator } from '../types/index.ts'
import { __validator_message_formator__ } from './constants.ts'
import { setMetadata } from './setMetadata.ts'

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
