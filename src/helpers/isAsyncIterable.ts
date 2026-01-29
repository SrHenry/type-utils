export function isAsyncIterable<T = unknown>(value: any): value is AsyncIterable<T> {
    return !!value?.[Symbol.asyncIterator]
}
