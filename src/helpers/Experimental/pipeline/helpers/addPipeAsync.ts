import type { WithPipeAsync } from '../types/WithPipeAsync'

import { getPipeFn } from './getPipeFn'

export function addPipeAsync<RValue>(
    rvalue: RValue | Promise<RValue>
): WithPipeAsync<typeof rvalue> {
    return Object.defineProperty(Object(rvalue), 'pipeAsync', {
        configurable: true,
        enumerable: false,
        get: () => getPipeFn(rvalue),
    })
}
