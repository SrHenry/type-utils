type ObjectKeys<T> = T extends object
    ? (keyof T)[]
    : T extends number
    ? []
    : T extends Array<any> | string
    ? string[]
    : never

type Fallback<T, TO, Includes = never> = T extends never | Includes ? TO : T

type ObjectEntry<T extends {}> = {
    [K in keyof T]: [K, T[K]]
}[keyof T]
type ObjectEntries<T extends {}> = ObjectEntry<T>[]
type Entry<T> = T extends any[] ? T : T extends {} ? ObjectEntry<T> : [string, any]
type Entries<T> = T extends any[] ? T : T extends {} ? ObjectEntries<T> : [string, any][]

type ObjectValue<T> = T extends any[]
    ? T
    : T extends {}
    ? ObjectEntry<T> extends [any, infer TValue]
        ? TValue
        : never
    : never

type ObjectValues<T extends {}> = ObjectValue<T>[]
type Value<T> = T extends any[] ? T : T extends {} ? ObjectValue<T> : any[]
type Values<T> = T extends any[] ? T : T extends {} ? ObjectValues<T> : any[]

interface ObjectConstructor {
    keys<T>(o: T): (keyof T)[]
    keys<T>(o: T): Fallback<ObjectKeys<T>, string[], never[]>
    // entries<T extends object>(o: T): [keyof T, T[keyof T]][]
    entries<T extends {}>(o: T): ObjectEntries<T>
    // entries<T>(o: ArrayLike<T>): [string, T][]
    values<T>(o: T): T[keyof T][]
}

declare const Object: ObjectConstructor
