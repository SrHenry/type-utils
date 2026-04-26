import { __message_formator__ } from './constants.ts'
import { setMetadata } from './setMetadata.ts'

export const setMessageFormator = <T>(formator: (...args: any[]) => string, arg: T): T =>
    setMetadata(__message_formator__, formator, arg)
