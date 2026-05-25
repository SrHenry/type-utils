export interface HasTapAsync<T> {
    readonly tapAsync: (
        fn: (value: Awaited<T>) => Promise<void> | void,
        options?: TapAsyncOptions
    ) => any
}

export interface TapAsyncOptions {
    swallow?: boolean
    catch?: (error: unknown) => void
}
