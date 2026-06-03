import type Generics from '../../../../Generics/index.ts'
import type { TypeGuard } from '../../../../TypeGuards/types/index.ts'
import type { Spread } from '../../../../types/index.ts'

type BaseTypes =
    | 'string'
    | 'number'
    | 'boolean'
    | 'symbol'
    | 'null'
    | 'undefined'
    | 'bigint'
    | 'object'
    | 'function'
    | 'enum'
    | 'primitive'
    | 'union'
    | 'intersection'
    | 'any'

type BaseStruct<T extends BaseTypes, U> = {
    type: T
    schema: TypeGuard<U>
    optional: boolean
}

export type PrimitiveStruct<T = Generics.PrimitiveType> = T extends Generics.PrimitiveType
    ? BaseStruct<'primitive', Generics.PrimitiveType>
    : never
export type AnyStruct = BaseStruct<'any', any>
export type UndefinedStruct<T = undefined> = T extends undefined
    ? BaseStruct<'undefined', undefined>
    : never
export type NullStruct<T = null> = T extends null ? BaseStruct<'null', null> : never
export type BooleanStruct<T = boolean> = T extends boolean ? BaseStruct<'boolean', T> : never
export type NumberStruct<T = number> = T extends number ? BaseStruct<'number', T> : never
export type BigIntStruct<T = bigint> = T extends bigint ? BaseStruct<'bigint', T> : never
export type StringStruct<T = string> = T extends string ? BaseStruct<'string', T> : never
export type SymbolStruct<T = symbol> = T extends symbol ? BaseStruct<'symbol', symbol> : never

type UnionOrIntersectionPartialStruct<T1, T2> = {
    types: [GenericStruct<T1>, GenericStruct<T2>]
}
type EnumPartialStruct<T> = {
    types: (
        | UndefinedStruct<T>
        | NullStruct<T>
        | BooleanStruct<T>
        | BigIntStruct<T>
        | NumberStruct<T>
        | StringStruct<T>
        | SymbolStruct<T>
        | BaseStruct<
              'undefined' | 'null' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol',
              T
          >
    )[]
}

export type EnumStruct<T extends Generics.PrimitiveType = any> = Spread<
    [BaseStruct<'enum', T>, EnumPartialStruct<T>]
>

export type UnionStruct<T1 = unknown, T2 = unknown> = Spread<
    [BaseStruct<'union', T1 | T2>, UnionOrIntersectionPartialStruct<T1, T2>]
>
export type IntersectionStruct<T1 = unknown, T2 = unknown> = Spread<
    [BaseStruct<'intersection', T1 & T2>, UnionOrIntersectionPartialStruct<T1, T2>]
>

export type ObjectTree<T> = {
    tree: {
        [K in keyof T]: GenericStruct<T[K]>
    }
}
export type ObjectStruct<T> = Spread<
    [
        BaseStruct<'object', T>,
        {
            [K2 in keyof ObjectTree<T>]: ObjectTree<T>[K2]
        },
    ]
>

export type ArrayEntries<U> = {
    entries: GenericStruct<U>
}

export type ArrayStruct<U> = Spread<
    [
        {
            [K1 in keyof BaseStruct<'object', U[]>]: BaseStruct<'object', U[]>[K1]
        },
        {
            [K2 in keyof ArrayEntries<U>]: ArrayEntries<U>[K2]
        },
    ]
>

export type GenericStruct<
    T = any,
    UnionOrIntersection extends 'union' | 'intersection' | true | false = true,
> =
    | Struct<T>
    | (UnionOrIntersection extends false
          ? never
          : UnionOrIntersection extends 'union'
            ? UnionStruct<T, T>
            : UnionOrIntersection extends 'intersection'
              ? IntersectionStruct<T, T>
              : UnionStruct<T, T> | IntersectionStruct<T, T>)

export type Struct<T = any> =
    | (T extends Generics.PrimitiveType
          ? T extends undefined
              ? UndefinedStruct
              : T extends null
                ? NullStruct
                : T extends boolean
                  ? BooleanStruct<T>
                  : T extends bigint
                    ? BigIntStruct<T>
                    : T extends number
                      ? NumberStruct<T>
                      : T extends string
                        ? StringStruct<T>
                        : T extends symbol
                          ? SymbolStruct
                          : PrimitiveStruct<T> | AnyStruct | EnumStruct<T>
          : never)
    | (T extends (infer _)[]
          ? never
          : T extends Generics.PrimitiveType
            ? never
            : T extends object
              ? ObjectStruct<T>
              : never)
    | (T extends (infer U)[] ? ArrayStruct<U> : never)

export type StructType =
    | PrimitiveStruct<Generics.PrimitiveType>
    | AnyStruct
    | UndefinedStruct
    | NullStruct
    | BooleanStruct
    | NumberStruct
    | BigIntStruct
    | StringStruct
    | SymbolStruct
    | UnionOrIntersectionPartialStruct<any, any>
    | EnumStruct<Generics.PrimitiveType>
    | UnionStruct<any>
    | IntersectionStruct<any>
