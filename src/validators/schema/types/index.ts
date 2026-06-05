import type { TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { TypeGuardFactory, TypeGuardFactoryType } from '../helpers/optional/types.ts'

import type * as V1 from './v1/index.ts'
import type * as V2 from './v2/index.ts'
import type { V3 } from './v3/index.ts'

export type { V1 }
export type { V2 }
export type { V3 } from './v3/index.ts'

// ─── Public V3 flat exports (explicit allowlist — no wildcard re-export) ───
// The wildcard `export * from './v3/index.ts'` leaked ~25 internal composition
// types (RequiredPartialStruct, OptionalPartialStruct, WithRulesStruct, MapToStructs,
// ExactExtends, IsExactExtension, ObjectTree, ClassInstanceRef, ArrayEntries,
// RecordMetadata, TupleMetadata, TupleToTypeGuardMap, TupleToStructMap,
// AsPrimitiveStruct, FromUnionStruct, FromIntersectionStruct, FromRecordStruct,
// FromClassInstanceStruct, FromTupleStruct, etc.) that are only meaningful as V3
// namespace internals.  Consumers should access them via `V3.<Name>` if needed.
// Only the 4 top-level flat exports are listed here:
export type { BaseStruct } from './v3/index.ts'
export type { TUnion, TIntersection } from './v3/index.ts'
export type { TypeGuardTupleUnwrap } from './v3/index.ts'

export type GetStruct<TFrom extends TypeGuard | TypeGuardFactory> =
    TFrom extends TypeGuard<infer T>
        ? V3.Struct<T>
        : TFrom extends TypeGuardFactory
          ? TypeGuardFactoryType<TFrom>
          : never

// Top-level V3 aliases — backward compat with consumers importing bare names
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

export type { Custom, CustomFactory, Rule, CreateRuleArgs } from '../../rules/types/index.ts'
