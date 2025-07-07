import type Generics from '../../Generics'
import type { GetTypeGuard, TypeGuard } from '../../TypeGuards/types'
import type { Spread } from '../../types'
import type { RecordRule } from '../rules/Record'

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

export type BaseStruct<T extends Generics.BaseTypes, U> = {
    type: T
    schema: TypeGuard<U>
    optional: boolean
    // tree?: {
    //     [K in keyof U]: BaseStruct<U[K] extends Generics.PrimitiveType ? Generics.GetPrimitiveTag<U[K]> : "object", U[K]>
    // }
}

export namespace V3 {
    export type PrimitiveStruct = BaseStruct<'primitive', Generics.PrimitiveType>
    export type AnyStruct = BaseStruct<'any', any>
    export type UndefinedStruct = BaseStruct<'undefined', undefined>
    export type NullStruct = BaseStruct<'null', null>
    export type BooleanStruct = BaseStruct<'boolean', boolean>
    export type NumberStruct = BaseStruct<'number', number>
    export type BigIntStruct = BaseStruct<'bigint', bigint>
    export type StringStruct = BaseStruct<'string', string>
    export type SymbolStruct = BaseStruct<'symbol', symbol>

    export type MapToStructs<Types extends any[]> = Types extends []
        ? []
        : Types extends [infer T0, ...infer TRest]
        ? [GenericStruct<T0>, ...MapToStructs<TRest>]
        : GenericStruct<any>[]

    export type TUnion<Types extends any[]> = Types extends []
        ? never
        : Types extends [infer T0, ...infer TRest]
        ? TRest extends []
            ? T0
            : T0 | TUnion<TRest>
        : any
    export type TIntersection<Types extends any[]> = Types extends []
        ? never
        : Types extends [infer T0, ...infer TRest]
        ? TRest extends []
            ? T0
            : T0 & TIntersection<TRest>
        : any

    export type ExactExtends<
        TSource,
        TCompare,
        TValueIfTrue = TSource,
        TValueIfFalse = never
    > = Exclude<TSource, TCompare> extends never ? TValueIfTrue : TValueIfFalse
    export type IsExactExtension<TSource, TCompare> = ExactExtends<TSource, TCompare, true, false>

    type UnionOrIntersectionPartialStruct<Types extends any[]> = {
        types: MapToStructs<Types>
    }
    type EnumPartialStruct = {
        types: (
            | UndefinedStruct
            | NullStruct
            | BooleanStruct
            | BigIntStruct
            | NumberStruct
            | StringStruct
            | SymbolStruct
        )[]
    }

    export type EnumStruct<T extends Generics.PrimitiveType = any> = BaseStruct<'enum', T> &
        EnumPartialStruct

    // export type UnionStruct<T extends Generics.PrimitiveType> = BaseStruct<'union', T>
    export type UnionStruct<Types extends any[]> = BaseStruct<'union', TUnion<Types>> &
        UnionOrIntersectionPartialStruct<Types>

    // export type intersectionStruct<T extends Generics.PrimitiveType> = BaseStruct<'intersection', T>
    export type IntersectionStruct<Types extends any[]> = BaseStruct<
        'intersection',
        TIntersection<Types>
    > &
        UnionOrIntersectionPartialStruct<Types>

    export type ObjectTree<T extends {}> = {
        tree: {
            [K in keyof T]: V3.GenericStruct<T[K]>
        }
    }
    export type ObjectStruct<T extends {}> = BaseStruct<'object', T> & ObjectTree<T>

    export type ArrayEntries<U> = {
        entries: V3.GenericStruct<U>
    }

    export type ArrayStruct<U> = BaseStruct<'object', U[]> & ArrayEntries<U>

    export type RecordMetadata<T extends {}> = {
        keyMetadata: V3.GenericStruct<keyof T>
        valueMetadata: V3.GenericStruct<T[keyof T]>
        rules: RecordRule[]
    }

    export type RecordStruct<K extends keyof any = string, T = any> = BaseStruct<
        'record',
        Record<K, T>
    > &
        RecordMetadata<Record<K, T>>

    export type GenericStruct<
        T = any,
        UnionOrIntersection extends 'union' | 'intersection' | true | false = true
    > = T extends Function
        ? AnyStruct & { schema: TypeGuard<T> }
        :
              | Struct<T>
              | (UnionOrIntersection extends false
                    ? never
                    : UnionOrIntersection extends 'union'
                    ? T extends any[]
                        ? UnionStruct<T>
                        : never
                    : UnionOrIntersection extends 'intersection'
                    ? T extends any[]
                        ? IntersectionStruct<T>
                        : never
                    : T extends any[]
                    ? UnionStruct<T> | IntersectionStruct<T>
                    : never)

    export type AsPrimitiveStruct<T extends Generics.PrimitiveType> = IsExactExtension<
        T,
        Generics.PrimitiveType
    > extends true
        ? PrimitiveStruct
        : IsExactExtension<T, undefined> extends true
        ? UndefinedStruct
        : IsExactExtension<T, null> extends true
        ? NullStruct
        : IsExactExtension<T, boolean> extends true
        ? BooleanStruct
        : IsExactExtension<T, bigint> extends true
        ? BigIntStruct
        : IsExactExtension<T, number> extends true
        ? NumberStruct
        : IsExactExtension<T, string> extends true
        ? StringStruct
        : IsExactExtension<T, symbol> extends true
        ? SymbolStruct
        : never

    export type Struct<T = any> = T extends Generics.PrimitiveType
        ?
              | EnumStruct<T>
              | (IsExactExtension<Generics.PrimitiveType, T> extends true
                    ? PrimitiveStruct
                    : IsExactExtension<T, undefined> extends true
                    ? UndefinedStruct
                    : IsExactExtension<T, null> extends true
                    ? NullStruct
                    : IsExactExtension<T, boolean> extends true
                    ? BooleanStruct
                    : IsExactExtension<T, bigint> extends true
                    ? BigIntStruct
                    : IsExactExtension<T, number> extends true
                    ? NumberStruct
                    : IsExactExtension<T, string> extends true
                    ? StringStruct
                    : IsExactExtension<T, symbol> extends true
                    ? SymbolStruct
                    : never)
        : T extends (infer U)[]
        ? ArrayStruct<U>
        : T extends {}
        ? ObjectStruct<T> | RecordStruct<keyof T, T[keyof T]>
        : never

    export type StructType =
        | PrimitiveStruct
        | AnyStruct
        | UndefinedStruct
        | NullStruct
        | BooleanStruct
        | NumberStruct
        | BigIntStruct
        | StringStruct
        | SymbolStruct
        | EnumStruct<Generics.PrimitiveType>
        | UnionStruct<any[]>
        | IntersectionStruct<any[]>
        | ObjectStruct<any>
        | ArrayStruct<any>
        | RecordStruct

    export type FromStruct<T extends Struct<any>> = T extends Struct<infer U> ? U : never
    export type FromUnionStruct<T extends UnionStruct<any>> = T extends UnionStruct<infer U>
        ? TUnion<U>
        : never
    export type FromIntersectionStruct<T extends IntersectionStruct<any>> =
        T extends IntersectionStruct<infer U> ? TIntersection<U> : never

    export type FromRecordStruct<T extends RecordStruct<any, any>> = T extends RecordStruct<
        infer K,
        infer T
    >
        ? Record<K, T>
        : never
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
            [K in keyof T]: V2.GenericStruct<T[K]>
        }
    }
    export type ObjectStruct<T> = Spread<
        [
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

    export type ArrayEntries<T extends Generics.BaseTypes, U> = {
        entries: BaseStruct<T, U> | ObjectStruct<U> | ArrayStruct<T, U>
    }
    export type ArrayStruct<T extends Generics.BaseTypes, U> = Spread<
        [
            {
                [K1 in keyof BaseStruct<'object', U>]: BaseStruct<'object', U>[K1]
            },
            {
                [K2 in keyof ArrayEntries<T, U>]: ArrayEntries<T, U>[K2]
            }
        ]
    >

    export type Struct<T extends Generics.BaseTypes, U> = U extends Generics.PrimitiveType
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
