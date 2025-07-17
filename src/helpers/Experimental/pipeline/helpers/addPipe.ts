import type { WithPipe } from '../types/WithPipe'

import { getPipeFn } from './getPipeFn'

export function addPipe<RValue>(rvalue: RValue | Promise<RValue>): WithPipe<typeof rvalue> {
    return Object.defineProperty(Object(rvalue), 'pipe', {
        configurable: true,
        enumerable: false,
        get: () => getPipeFn(rvalue),
    })
}
