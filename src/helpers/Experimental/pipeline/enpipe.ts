import type { internal } from './types/Pipable'

import { pipe } from './pipe'

export function enpipe<TValue extends {}>(value: TValue): internal.Pipe<TValue> {
    return <internal.Pipe<TValue>>pipe(value).pipe
}
