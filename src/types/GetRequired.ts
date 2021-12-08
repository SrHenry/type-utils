type GetRequiredKeys<T> = NonNullable<{
    [K in keyof T]: T[K] extends null | NonNullable<T[K]> ? K : never
}[keyof T]>


export type GetRequired<T> = T extends undefined ? never : {
    [K in GetRequiredKeys<T>]: T[K]
}