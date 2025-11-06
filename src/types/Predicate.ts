// export type Predicate<T> = Func<[value: T], boolean>
export type Predicate<T, U extends T = T> = T extends U
    ? (value: T) => boolean
    : (value: T) => value is U
