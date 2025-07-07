import { __curry_param__, __message__ } from './constants'
import { setMetadata } from './setMetadata'

export function setMessage(message: string): <T extends Object>(into: T) => T
export function setMessage<T extends Object>(message: string, into: T): T
export function setMessage<T extends Object>(
    message: string,
    arg: T | typeof __curry_param__ = __curry_param__
) {
    if (arg === __curry_param__) return (arg: T): T => setMessage(message, arg)

    return setMetadata(__message__, String(message), arg)
}
