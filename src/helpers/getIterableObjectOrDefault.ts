import { createDefaultGenerator } from './createDefaultGenerator'
import { isIterable } from './isIterable'

export function getIterableObjectOrDefault<T>(from: Iterator<T>): IterableIterator<T> {
    if (isIterable(from)) return from as IterableIterator<T>

    return createDefaultGenerator<T>(from)
}
