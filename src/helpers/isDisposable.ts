export function isDisposable(value: any): value is Disposable {
    return !!value?.[Symbol.dispose]
}
