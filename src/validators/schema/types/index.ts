import type Generics from '../../../Generics/index.ts'
import type { GetTypeGuard, TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { Spread } from '../../../types/index.ts'
import type {
    OptionalizeTypeGuard,
    TypeGuardFactory,
    TypeGuardFactoryType,
} from '../helpers/optional/types.ts'

import type { V3, BaseStruct } from './v3/index.ts'

export * from './v3/index.ts'
export type { V3 } from './v3/index.ts'

export type Optionalize<T> = {
    [K in keyof T]: T[K] extends () => TypeGuard<any | any[]>
        ? (...args: Parameters<T[K]>) => OptionalizeTypeGuard<ReturnType<T[K]>>
        : T[K]
}

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
export type GetStruct<TFrom extends TypeGuard | TypeGuardFactory> =
    TFrom extends TypeGuard<infer T>
        ? V3.Struct<T>
        : TFrom extends TypeGuardFactory
          ? TypeGuardFactoryType<TFrom>
          : never

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
            },
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
            },
        ]
    >

    export type GenericStruct<
        T = any,
        UnionOrIntersection extends 'union' | 'intersection' | true | false = true,
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
            },
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
            },
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
                          },
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
                            },
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
                            V extends Generics.PrimitiveType
                                ? Generics.GetPrimitiveTag<V>
                                : 'object',
                            V
                        >
                    },
                ]
            >
          : // biome-ignore lint/complexity/noBannedTypes: Function used in conditional type for function detection
            U extends Function
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
    UnionOrIntersection extends 'union' | 'intersection' | true | false = true,
> = V3.GenericStruct<T, UnionOrIntersection>
export type Struct<T = any> = V3.Struct<T>
export type StructType = V3.StructType

export type * from './BooleanSchema.ts'
export type * from './NullSchema.ts'
export type * from './UndefinedSchema.ts'
export type * from './SymbolSchema.ts'
export type * from './AnySchema.ts'
export type * from './PrimitiveSchema.ts'
export type * from './EnumSchema.ts'
export type * from './ObjectSchema.ts'
export type * from './TupleSchema.ts'
export type * from './UnionSchema.ts'
export type * from './IntersectionSchema.ts'
export type * from './GetSchema.ts'
export type * from './FluentSchema.ts'
export type * from './FluentOptionalSchema.ts'
export type * from './StringSchema.ts'
export type * from './NumberSchema.ts'
export type * from './BigIntSchema.ts'
export type * from './ArraySchema.ts'
export type * from './RecordSchema.ts'

export type { ValidateReturn } from '../../types/ValidateReturn.ts'

export type {
    Custom,
    CustomFactory,
    Rule,
    RuleStruct,
    CreateRuleArgs,
    CUSTOM_RULE_BRAND,
} from '../../rules/types/index.ts'
