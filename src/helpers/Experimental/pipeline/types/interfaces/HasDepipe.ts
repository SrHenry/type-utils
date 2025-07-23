import { Depipe } from '../Depipe'

export interface HasDepipe<T> {
    readonly depipe: Depipe<T>
}
