import { CustomHandler } from '../types'

export const isCustomHandler = <Handler extends CustomHandler = CustomHandler<unknown[], unknown>>(
    handler: unknown
): handler is Handler =>
    typeof handler === 'function' &&
    typeof handler(void 0) === 'function' &&
    typeof handler(void 0)() === 'boolean'
