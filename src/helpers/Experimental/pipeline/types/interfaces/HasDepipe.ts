import { Depipe } from '../Depipe.ts'

export interface HasDepipe<T> {
    readonly depipe: Depipe<T>
}
