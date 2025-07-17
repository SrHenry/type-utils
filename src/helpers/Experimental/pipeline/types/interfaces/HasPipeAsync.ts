import { AsyncPipe } from '../AsyncPipe'

export interface HasPipeAsync<T> {
    readonly pipeAsync: AsyncPipe<Awaited<T>>
}
