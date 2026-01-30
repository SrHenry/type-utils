import { asTypeGuard } from '../../../TypeGuards'
import type { CustomHandler } from '../types'

export const isCustomHandler = asTypeGuard<CustomHandler>(
    (handler: unknown) =>
        typeof handler === 'function' &&
        typeof handler(void 0) === 'function' &&
        typeof handler(void 0)() === 'boolean',
    {
        rules: [],
        kind: 'function',
        context: {
            struct: {
                type: 'function',
                templates: [
                    {
                        name: 'Subject',
                        default: 'any',
                    },
                ],
                args: [{ type: 'template::Subject', name: 'subject' }],
                return: {
                    type: 'function',
                    templates: [
                        {
                            name: 'Args',
                            extends: {
                                type: 'Array',
                                of: 'any',
                            },
                            default: {
                                type: 'Array',
                                of: 'any',
                            },
                        },
                    ],
                    args: [
                        {
                            type: 'varyadic::template::Args',
                        },
                    ],
                    return: { type: 'boolean' },
                },
            },
        },
    }
) as <Handler extends CustomHandler = CustomHandler<unknown[], unknown>>(
    handler: unknown
) => handler is Handler
