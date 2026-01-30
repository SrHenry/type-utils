export function isAsyncDisposable(value: any): value is AsyncDisposable {
    return !!value?.[Symbol.asyncDispose]
}
