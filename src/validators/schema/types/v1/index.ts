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
        },
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
                        V extends Generics.PrimitiveType ? Generics.GetPrimitiveTag<V> : 'object',
                        V
                    >
                },
            ]
        >
      : // biome-ignore lint/complexity/noBannedTypes: Function used in conditional type for function detection
        U extends Function
        ? BaseStruct<'function', U>
        : U extends object
          ? ObjectStruct<U>
          : never
