import type { WithDepipe } from '../types/WithDepipe.ts'

import { depipe } from './depipe.ts'

export function addDepipe<RValue>(rvalue: RValue | Promise<RValue>): WithDepipe<typeof rvalue> {
    return Object.defineProperty(Object(rvalue), 'depipe', {
        configurable: true,
        enumerable: false,
        get: () => depipe.bind(null, rvalue),
    })
}
