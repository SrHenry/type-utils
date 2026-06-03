import type { GetTypeGuard, TypeGuard } from '../../../TypeGuards/types/index.ts'
import type {
    OptionalizeTypeGuard,
    TypeGuardFactory,
    TypeGuardFactoryType,
} from '../helpers/optional/types.ts'

import type * as V1 from './v1/index.ts'
import type * as V2 from './v2/index.ts'
import type { V3 } from './v3/index.ts'

export type { V1 }
export type { V2 }
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

export type GenericStruct<
    T = any,
    UnionOrIntersection extends 'union' | 'intersection' | true | false = true,
> = V3.GenericStruct<T, UnionOrIntersection>
export type ObjectStruct<T extends {}> = V3.ObjectStruct<T>
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
