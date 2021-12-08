type GetOptionalKeys<T> = NonNullable<{
    [K in keyof T]: T[K] extends null | NonNullable<T[K]> ? never : K
}[keyof T]>

export type GetOptional<T> = T extends undefined ? never : {
    [K in GetOptionalKeys<T>]+?: Exclude<T[K], undefined>
};