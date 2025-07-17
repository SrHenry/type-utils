import { depipe } from '../depipe'
import type { WithDepipe } from '../types/WithDepipe'

/** TODO: create a getDepipeFn to decouple from exported depipe helper */
export function addDepipe<RValue>(rvalue: RValue | Promise<RValue>): WithDepipe<typeof rvalue> {
    return Object.defineProperty(Object(rvalue), 'depipe', {
        configurable: true,
        enumerable: false,
        get: () => depipe.bind(null, rvalue),
    })
}
