type ObjectKeys<T> = T extends object
    ? (keyof T)[]
    : T extends number
    ? []
    : T extends Array<any> | string
    ? string[]
    : never

type Fallback<T, TO, Includes = never> = T extends never | Includes ? TO : T

interface ObjectConstructor {
    keys<T>(o: T): (keyof T)[]
    keys<T>(o: T): Fallback<ObjectKeys<T>, string[], never[]>
    entries<T extends object>(o: T): [keyof T, T[keyof T]][]
    entries<T>(o: ArrayLike<T>): [string, T][]
    values<T>(o: T): T[keyof T][]
}

declare const Object: ObjectConstructor
