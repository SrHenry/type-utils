import { __message_formator__ } from './constants.ts'
import { defaultMessageFormator } from './defaultMessageFormator.ts'
import { getMetadata } from './getMetadata.ts'

export const getMessageFormator = <T>(arg: T) =>
    getMetadata(__message_formator__, arg) ?? defaultMessageFormator
