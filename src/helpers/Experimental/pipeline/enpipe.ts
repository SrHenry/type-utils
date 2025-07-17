import { pipe } from './pipe'
import { Pipe } from './types/Pipe'

export function enpipe<TValue extends {}>(value: TValue): Pipe<TValue> {
    return <Pipe<TValue>>pipe(value).pipe
}
