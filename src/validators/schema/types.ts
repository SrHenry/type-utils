import type Generics from '../../Generics'
import type { GetTypeGuard, TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import type { Spread } from '../../types'
import type { Custom as CustomRule } from '../rules/types'

export type Optionalize<T> = {
    [K in keyof T]: T[K] extends () => TypeGuard<any | any[]>
        ? (...args: Parameters<T[K]>) => OptionalizeTypeGuard<ReturnType<T[K]>>
        : T[K]
}

export type OptionalizeTypeGuard<T extends TypeGuard<any | any[]>> = TypeGuard<
    GetTypeGuard<T> | undefined
>
export type OptionalizeTypeGuardClosure<
    T extends TypeGuardClosure<ClosureGuard, ClosureArgs>,
    ClosureGuard = any,
    ClosureArgs extends any[] = any[]
> = TypeGuardClosure<GetTypeGuard<ReturnType<T> | undefined>, Parameters<T>>

export type TypeGuardClosure<T = any, Params extends any[] = any[]> = (
    ...args: Params
) => TypeGuard<T>

export type GetSchemaStruct<T extends TypeGuard> = GetStruct<GetTypeGuard<T>>

/* export type GetStruct<T> = T extends Array<infer Inner>
    ? GetStruct<Inner>[]
    : T extends Generics.PrimitiveType
    ? Struct<Generics.GetPrimitiveTag<T, T>
    : T extends Function
    ? never
    : {
          [K in keyof T]: GetStruct<T[K]>
      } */
export type GetStruct<T> = Struct<T>

export type BaseTypes =
    | typeof Generics.TypeOfTag[number]
    | 'enum'
    | 'primitive'
    | 'union'
    | 'intersection'
    | 'any'

export type BaseStruct<T extends BaseTypes, U> = {
    type: T
    schema: TypeGuard<U>
    optional: boolean
    // tree?: {
    //     [K in keyof U]: BaseStruct<U[K] extends Generics.PrimitiveType ? Generics.GetPrimitiveTag<U[K]> : "object", U[K]>
    // }
}

export namespace V2 {
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
            | V2.UndefinedStruct<T>
            | V2.NullStruct<T>
            | V2.BooleanStruct<T>
            | V2.BigIntStruct<T>
            | V2.NumberStruct<T>
            | V2.StringStruct<T>
            | V2.SymbolStruct<T>
            | BaseStruct<
                  'undefined' | 'null' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol',
                  T
              >
        )[]
        // | V2.PrimitiveStruct<T>
    }

    export type EnumStruct<T extends Generics.PrimitiveType = any> = Spread<
        [BaseStruct<'enum', T>, EnumPartialStruct<T>]
    >

    // export type UnionStruct<T extends Generics.PrimitiveType> = BaseStruct<'union', T>
    export type UnionStruct<T1 = unknown, T2 = unknown> = Spread<
        [BaseStruct<'union', T1 | T2>, UnionOrIntersectionPartialStruct<T1, T2>]
    >
    // export type intersectionStruct<T extends Generics.PrimitiveType> = BaseStruct<'intersection', T>
    export type IntersectionStruct<T1 = unknown, T2 = unknown> = Spread<
        [BaseStruct<'intersection', T1 & T2>, UnionOrIntersectionPartialStruct<T1, T2>]
    >

    export type ObjectTree<T> = {
        tree: {
            // [K in keyof T]: Struct<
            //     T[K] extends Generics.PrimitiveType ? Generics.GetPrimitiveTag<T[K]> : 'object',
            //     T[K]
            // >
            [K in keyof T]: V2.GenericStruct<T[K]>
        }
    }
    export type ObjectStruct<T> = Spread<
        [
            // {
            //     [K1 in keyof BaseStruct<'object', T>]: BaseStruct<'object', T>[K1]
            // },
            BaseStruct<'object', T>,
            {
                [K2 in keyof ObjectTree<T>]: V2.ObjectTree<T>[K2]
            }
        ]
    >

    export type ArrayEntries<U> = {
        entries: V2.GenericStruct<U>
    }

    export type ArrayStruct<U> = Spread<
        [
            {
                [K1 in keyof BaseStruct<'object', U[]>]: BaseStruct<'object', U[]>[K1]
            },
            {
                [K2 in keyof ArrayEntries<U>]: ArrayEntries<U>[K2]
            }
        ]
    >

    export type GenericStruct<
        T = any,
        UnionOrIntersection extends 'union' | 'intersection' | true | false = true
    > =
        | V2.Struct<T>
        | (UnionOrIntersection extends false
              ? never
              : UnionOrIntersection extends 'union'
              ? V2.UnionStruct<T, T>
              : UnionOrIntersection extends 'intersection'
              ? V2.IntersectionStruct<T, T>
              : V2.UnionStruct<T, T> | V2.IntersectionStruct<T, T>)

    export type Struct<T = any> =
        | (T extends Generics.PrimitiveType
              ? T extends undefined
                  ? V2.UndefinedStruct
                  : T extends null
                  ? V2.NullStruct
                  : T extends boolean
                  ? V2.BooleanStruct<T>
                  : T extends bigint
                  ? V2.BigIntStruct<T>
                  : T extends number
                  ? V2.NumberStruct<T>
                  : T extends string
                  ? V2.StringStruct<T>
                  : T extends symbol
                  ? V2.SymbolStruct
                  : V2.PrimitiveStruct<T> | V2.AnyStruct | V2.EnumStruct<T>
              : never)
        | (T extends (infer _)[]
              ? never
              : T extends Generics.PrimitiveType
              ? never
              : T extends object
              ? V2.ObjectStruct<T>
              : never)
        | (T extends (infer U)[] ? V2.ArrayStruct<U> : never)

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
    // type aa = Struct<{ a: 1; b: { c: 'a1b2c3'; d: { e: { f: true }[] } } }>

    // const A: aa = {
    //     type: 'object',
    //     tree: {
    //         a: {
    //             type: 'number',
    //         },
    //     },
    // }

    // type aaa = aa['type'] extends 'object' ? aa['tree']['b']['d']['e']['f']['type'] : 'object'
    // type b = Struct<[{ a: 1 }]>
}

export namespace V1 {
    export type ObjectTree<T> = {
        tree: {
            [K in keyof T]: Struct<
                T[K] extends Generics.PrimitiveType ? Generics.GetPrimitiveTag<T[K]> : 'object',
                T[K]
            >
        }
    }
    export type ObjectStruct<T> = Spread<
        [
            {
                [K1 in keyof BaseStruct<'object', T>]: BaseStruct<'object', T>[K1]
            },
            {
                [K2 in keyof ObjectTree<T>]: ObjectTree<T>[K2]
            }
        ]
    >

    export type ArrayEntries<T extends BaseTypes, U> = {
        entries: BaseStruct<T, U> | ObjectStruct<U> | ArrayStruct<T, U>
    }
    export type ArrayStruct<T extends BaseTypes, U> = Spread<
        [
            {
                [K1 in keyof BaseStruct<'object', U>]: BaseStruct<'object', U>[K1]
            },
            {
                [K2 in keyof ArrayEntries<T, U>]: ArrayEntries<T, U>[K2]
            }
        ]
    >

    export type Struct<T extends BaseTypes, U> = U extends Generics.PrimitiveType
        ? T extends 'enum'
            ? BaseStruct<'enum', U>
            : T extends 'primitive'
            ? BaseStruct<'primitive', Generics.PrimitiveType>
            : T extends 'union'
            ? Spread<
                  [
                      BaseStruct<'union', U>,
                      {
                          tree: Struct<
                              U extends Generics.PrimitiveType
                                  ? Generics.GetPrimitiveTag<U>
                                  : 'object',
                              U
                          >[]
                      }
                  ]
              >
            : T extends 'intersection'
            ? Spread<
                  [
                      BaseStruct<'intersection', U>,
                      {
                          tree: Struct<
                              U extends Generics.PrimitiveType
                                  ? Generics.GetPrimitiveTag<U>
                                  : 'object',
                              U
                          >[]
                      }
                  ]
              >
            : T extends 'any'
            ? BaseStruct<'any', any>
            : T extends 'undefined'
            ? BaseStruct<'undefined', undefined>
            : T extends 'null'
            ? BaseStruct<'null', null>
            : U extends boolean
            ? BaseStruct<'boolean', boolean>
            : BaseStruct<T, U> & {
                  tree?: undefined
              }
        : U extends Array<infer V>
        ? Spread<
              [
                  BaseStruct<'object', U>,
                  {
                      entries: Struct<
                          V extends Generics.PrimitiveType ? Generics.GetPrimitiveTag<V> : 'object',
                          V
                      >
                  }
              ]
          >
        : U extends Function
        ? BaseStruct<'function', U>
        : U extends object
        ? V1.ObjectStruct<U>
        : never
}

// const struct: V2.Struct = {
//     // type: 'object',
//     type: 'boolean',
//     // schema: array(string()),
//     // schema: array(boolean()),
//     schema: boolean(),
//     optional: false,
//     entries: {
//         type: 'boolean',
//         optional: false,
//         schema: boolean(),
//     },
// }

export type PrimitiveStruct<T = Generics.PrimitiveType> = V2.PrimitiveStruct<T>
export type AnyStruct = V2.AnyStruct
export type UndefinedStruct = V2.UndefinedStruct
export type NullStruct = V2.NullStruct
export type BooleanStruct<T extends boolean = boolean> = V2.BooleanStruct<T>
export type BigIntStruct<T extends bigint = bigint> = V2.BigIntStruct<T>
export type NumberStruct<T extends number = number> = V2.NumberStruct<T>
export type StringStruct<T extends string = string> = V2.StringStruct<T>
export type SymbolStruct = V2.SymbolStruct
export type EnumStruct<T extends Generics.PrimitiveType> = V2.EnumStruct<T>
export type UnionStruct<
    T1 extends Generics.PrimitiveType = Generics.PrimitiveType,
    T2 extends Generics.PrimitiveType = Generics.PrimitiveType
> = V2.UnionStruct<T1, T2>
export type IntersectionStruct<
    T1 extends Generics.PrimitiveType = Generics.PrimitiveType,
    T2 extends Generics.PrimitiveType = Generics.PrimitiveType
> = V2.IntersectionStruct<T1, T2>
export type ArrayStruct<U> = V2.ArrayStruct<U>
export type ObjectStruct<T> = V2.ObjectStruct<T>

export type GenericStruct<
    T = any,
    UnionOrIntersection extends 'union' | 'intersection' | true | false = true
> = V2.GenericStruct<T, UnionOrIntersection>
export type Struct<T = any> = V2.Struct<T>
export type StructType = V2.StructType

export type Exact<T> = CustomRule<[to: T], '__Custom.exact__'>
