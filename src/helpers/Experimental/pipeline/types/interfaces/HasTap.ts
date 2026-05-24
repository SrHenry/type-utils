export interface HasTap<T> {
    readonly tap: (fn: (value: T) => void, options?: TapOptions) => any
}

export interface TapOptions {
    swallow?: boolean
    catch?: (error: unknown) => void
}
