import { __message_formator__ } from './constants'
import { defaultMessageFormator } from './defaultMessageFormator'
import { getMetadata } from './getMetadata'

export const getMessageFormator = <T>(arg: T) =>
    getMetadata(__message_formator__, arg) ?? defaultMessageFormator
