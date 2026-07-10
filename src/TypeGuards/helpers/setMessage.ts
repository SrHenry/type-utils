import { __curry_param__, __message__ } from './constants.ts'
import { setMetadata } from './setMetadata.ts'

export function setMessage(message: string): <T extends object>(into: T) => T
export function setMessage<T extends object>(message: string, into: T): T
export function setMessage<T extends object>(
    message: string,
    arg: T | typeof __curry_param__ = __curry_param__
) {
    if (arg === __curry_param__)
        // biome-ignore lint/suspicious/noShadow: currying pattern — inner param fills outer's slot
        return (arg: T): T => setMessage(message, arg)

    return setMetadata(__message__, message, arg)
}
