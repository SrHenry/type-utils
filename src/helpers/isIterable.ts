export function isIterable<T = unknown>(value: any): value is Iterable<T> {
    return !!value?.[Symbol.iterator]
}
