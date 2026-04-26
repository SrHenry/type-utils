import { createDefaultGenerator } from './createDefaultGenerator.ts'
import { isIterable } from './isIterable.ts'

export function getIterableObjectOrDefault<T>(from: Iterator<T>): IterableIterator<T> {
    if (isIterable(from)) return from as IterableIterator<T>

    return createDefaultGenerator<T>(from)
}
