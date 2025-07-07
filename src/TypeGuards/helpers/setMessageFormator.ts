import { __message_formator__ } from './constants'
import { setMetadata } from './setMetadata'

export const setMessageFormator = <T>(formator: (...args: any[]) => string, arg: T): T =>
    setMetadata(__message_formator__, formator, arg)
