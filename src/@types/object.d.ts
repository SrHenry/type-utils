type ObjectKeys<T> = T extends object
    ? (keyof T)[]
    : T extends number
      ? []
      : T extends any[] | string
        ? string[]
        : never

type Fallback<T, TO, Includes = never> = T extends never | Includes ? TO : T

type ObjectEntry<T extends {}> = {
    [K in keyof T]: [K, T[K]]
}[keyof T]
type ObjectEntries<T extends {}> = ObjectEntry<T>[]
type Entry<T> = T extends any[]
    ? T // biome-ignore lint/complexity/noBannedTypes: {} used in conditional type
    : T extends {}
      ? ObjectEntry<T>
      : [string, any]
type Entries<T> = T extends any[]
    ? T // biome-ignore lint/complexity/noBannedTypes: {} used in conditional type
    : T extends {}
      ? ObjectEntries<T>
      : [string, any][]

type ObjectValue<T> = T extends any[]
    ? T
    : // biome-ignore lint/complexity/noBannedTypes: {} used in conditional type
      T extends {}
      ? ObjectEntry<T> extends [any, infer TValue]
          ? TValue
          : never
      : never

type ObjectValues<T extends {}> = ObjectValue<T>[]
type Value<T> = T extends any[]
    ? T // biome-ignore lint/complexity/noBannedTypes: {} used in conditional type
    : T extends {}
      ? ObjectValue<T>
      : any[]
type Values<T> = T extends any[]
    ? T // biome-ignore lint/complexity/noBannedTypes: {} used in conditional type
    : T extends {}
      ? ObjectValues<T>
      : any[]

interface ObjectConstructor {
    keys<T>(o: T): (keyof T)[]
    keys<T>(o: T): Fallback<ObjectKeys<T>, string[], never[]>
    // entries<T extends object>(o: T): [keyof T, T[keyof T]][]
    entries<T extends {}>(o: T): ObjectEntries<T>
    // entries<T>(o: ArrayLike<T>): [string, T][]
    values<T>(o: T): T[keyof T][]
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: ambient augmentation of global Object
declare const Object: ObjectConstructor

interface ArrayConstructor {
    isArray<T = any>(arg: any): arg is T[]
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: ambient augmentation of global Array
declare var Array: ArrayConstructor

/** string values returned by `typeof` operator */
declare type TypeOfTag =
    | 'undefined'
    | 'boolean'
    | 'string'
    | 'number'
    | 'bigint'
    | 'symbol'
    | 'object'
    | 'function'

/**
 * Type helper to collapse object intersections that aren't merged already.
 *
 * @see https://www.totaltypescript.com/concepts/the-prettify-helper
 */
declare type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

type Replace<TOrigin extends {}, TReplace extends Partial<Record<keyof TOrigin, any>>> = Prettify<
    Omit<TOrigin, keyof TReplace> & {
        [K in keyof TReplace]: TReplace[K]
    }
>
