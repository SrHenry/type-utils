import type Generics from '../../Generics'
import type { ConstructorSignature, GetTypeGuard, TypeGuard } from '../../TypeGuards/types'
import type { Spread } from '../../types'
import type { ArrayRule } from '../rules/Array'
import type { NumberRule } from '../rules/Number'
import type { RecordRule } from '../rules/Record'
import type { StringRule } from '../rules/String'
import type { All as AllRules, RuleStruct } from '../rules/types'
import type { TypeGuardFactory, TypeGuardFactoryType } from './helpers/optional/types'

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
export type GetStruct<TFrom extends TypeGuard | TypeGuardFactory> = TFrom extends TypeGuard<infer T>
    ? Struct<T>
    : TFrom extends TypeGuardFactory
    ? TypeGuardFactoryType<TFrom>
    : never

export type BaseStruct<T extends Generics.BaseTypes | 'custom', U> = {
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
    export type NumberStruct = BaseStruct<'number', number> & WithRulesStruct<NumberRule>
    export type BigIntStruct = BaseStruct<'bigint', bigint> & WithRulesStruct<NumberRule>
    export type StringStruct = BaseStruct<'string', string> & WithRulesStruct<StringRule>
    export type SymbolStruct = BaseStruct<'symbol', symbol>

    export type WithRulesStruct<Rule extends AllRules<any[], string, any>> = {
        rules: RuleStruct<Rule>[]
    }

    export type MapToStructs<Types extends any[]> = Types extends []
        ? []
        : Types extends [infer T0, ...infer TRest]
        ? [GenericStruct<T0> | CustomStruct<T0>, ...MapToStructs<TRest>]
        : (GenericStruct<any> | CustomStruct<any>)[]

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

    export type ClassInstanceRef<T extends {}, ClassNameStr = string> = {
        constructor: ConstructorSignature<T>
        className: ClassNameStr
    }

    export type ClassInstanceStruct<T extends {}, ClassNameStr = string> = BaseStruct<'object', T> &
        ObjectTree<{}> &
        ClassInstanceRef<T, ClassNameStr>

    export type ArrayEntries<U> = {
        entries: V3.GenericStruct<U>
    }

    export type ArrayStruct<U> = BaseStruct<'object', U[]> &
        ArrayEntries<U> &
        WithRulesStruct<ArrayRule>

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

    export type TupleMetadata<T extends readonly [...any]> = {
        elements: TupleToStructMap<T>
    }

    export type TupleToTypeGuardMap<T extends readonly [...any]> = T extends readonly [
        infer T0,
        ...infer TRest
    ]
        ? readonly [TypeGuard<T0>, ...TupleToTypeGuardMap<TRest>]
        : T

    export type TupleToStructMap<T extends readonly [...any]> = T extends readonly [
        infer T0,
        ...infer TRest
    ]
        ? readonly [V3.GenericStruct<T0>, ...TupleToStructMap<TRest>]
        : T

    export type TypeGuardTupleUnwrap<T extends readonly [...any]> = T extends readonly [
        infer T0,
        ...infer TRest
    ]
        ? T0 extends TypeGuard<infer U>
            ? [U, ...TypeGuardTupleUnwrap<TRest>]
            : [T0, ...TypeGuardTupleUnwrap<TRest>]
        : T

    export type TupleStruct<T extends readonly [...any]> = BaseStruct<'tuple', T> & TupleMetadata<T>

    export type CustomStruct<T> = Prettify<
        BaseStruct<'custom', T> & {
            /** kind of the custom struct's value mapped */
            kind?: string
            /** context metadata for the custom struct */
            context?: Record<string, any> | null
        }
    >

    export type GenericStruct<
        T = any,
        UnionOrIntersection extends 'union' | 'intersection' | true | false = true
    > = T extends Function
        ? AnyStruct & { schema: TypeGuard<T> }
        :
              | Struct<T>
              | CustomStruct<T>
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
        : T extends readonly [...any]
        ? TupleStruct<T>
        : T extends (infer U)[]
        ? ArrayStruct<U>
        : T extends {}
        ? ObjectStruct<T> | RecordStruct<keyof T, T[keyof T]> | ClassInstanceStruct<T>
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
        | ClassInstanceStruct<any>
        | TupleStruct<any[]>

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

    export type FromClassInstanceStruct<T extends ClassInstanceStruct<any>> =
        T extends ClassInstanceStruct<infer U> ? U : never

    export type FromTupleStruct<T extends TupleStruct<any>> = T extends TupleStruct<infer U>
        ? U
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

export type PrimitiveStruct<T extends Generics.PrimitiveType = Generics.PrimitiveType> = Prettify<
    Omit<V3.PrimitiveStruct, 'schema'> & { schema: TypeGuard<T> }
>
export type AnyStruct = V3.AnyStruct
export type UndefinedStruct = V3.UndefinedStruct
export type NullStruct = V3.NullStruct
export type BooleanStruct = V3.BooleanStruct
export type BigIntStruct = V3.BigIntStruct
export type NumberStruct = V3.NumberStruct
export type StringStruct = V3.StringStruct
export type SymbolStruct = V3.SymbolStruct
export type EnumStruct<T extends Generics.PrimitiveType> = V3.EnumStruct<T>

export type UnionStruct<Types extends any[]> = V3.UnionStruct<Types>
export type IntersectionStruct<Types extends any[]> = V3.IntersectionStruct<Types>
export type TupleStruct<Types extends readonly any[]> = V3.TupleStruct<Types>
export type ArrayStruct<U> = V3.ArrayStruct<U>
export type ObjectStruct<T extends {}> = V3.ObjectStruct<T>
export type RecordStruct<K extends keyof any = string, T = any> = V3.RecordStruct<K, T>
export type ClassInstanceStruct<T extends {}, ClassNameStr = string> = V3.ClassInstanceStruct<
    T,
    ClassNameStr
>
export type CustomStruct<T> = V3.CustomStruct<T>

export type GenericStruct<
    T = any,
    UnionOrIntersection extends 'union' | 'intersection' | true | false = true
> = V3.GenericStruct<T, UnionOrIntersection>
export type Struct<T = any> = V3.Struct<T>
export type StructType = V3.StructType
