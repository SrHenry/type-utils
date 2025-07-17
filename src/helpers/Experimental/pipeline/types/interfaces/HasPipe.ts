import { Pipe } from '../Pipe'

export interface HasPipe<T> {
    readonly pipe: Pipe<T>
}
