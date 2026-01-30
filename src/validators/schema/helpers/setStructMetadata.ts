import type Generics from '../../../Generics'
import type { TypeGuard } from '../../../TypeGuards/types'
import type { TypeFromArray } from '../../../types'
import type { V3 } from '../types'

import { setMetadata } from '../../../TypeGuards/helpers/setMetadata'
import { __metadata__ } from './constants'

export function setStructMetadata<TSource>(
    struct: V3.GenericStruct<TSource, false>,
    guard: TypeGuard<TSource>
): typeof guard
export function setStructMetadata<TSource extends Generics.PrimitiveType>(
    struct: V3.EnumStruct<TSource>,
    guard: TypeGuard<TSource>
): typeof guard
export function setStructMetadata(
    struct: V3.PrimitiveStruct,
    guard: TypeGuard<Generics.PrimitiveType>
): typeof guard
export function setStructMetadata(struct: V3.NullStruct, guard: TypeGuard<null>): typeof guard
export function setStructMetadata(
    struct: V3.UndefinedStruct,
    guard: TypeGuard<undefined>
): typeof guard
export function setStructMetadata(struct: V3.StringStruct, guard: TypeGuard<string>): typeof guard
export function setStructMetadata(struct: V3.NumberStruct, guard: TypeGuard<number>): typeof guard
export function setStructMetadata(struct: V3.BigIntStruct, guard: TypeGuard<bigint>): typeof guard
export function setStructMetadata(struct: V3.BooleanStruct, guard: TypeGuard<boolean>): typeof guard
export function setStructMetadata(struct: V3.SymbolStruct, guard: TypeGuard<symbol>): typeof guard
export function setStructMetadata<TSource extends {}>(
    struct: V3.ObjectStruct<TSource>,
    guard: TypeGuard<TSource>
): typeof guard
export function setStructMetadata<TSource>(
    struct: V3.ArrayStruct<TypeFromArray<TSource>>,
    guard: TypeGuard<TSource>
): typeof guard

export function setStructMetadata<TStruct extends V3.RecordStruct<any, any>>(
    struct: TStruct,
    guard: TypeGuard<V3.FromRecordStruct<TStruct>>
): typeof guard
export function setStructMetadata<TStruct extends V3.ClassInstanceStruct<any>>(
    struct: TStruct,
    guard: TypeGuard<V3.FromClassInstanceStruct<TStruct>>
): typeof guard
export function setStructMetadata<TKey extends keyof any, TValue>(
    struct: V3.RecordStruct<TKey, TValue>,
    guard: TypeGuard<Record<TKey, TValue>>
): typeof guard
export function setStructMetadata<TStruct extends V3.TupleStruct<any[]>>(
    struct: TStruct,
    guard: TypeGuard<V3.FromTupleStruct<TStruct>>
): typeof guard
export function setStructMetadata<TStruct extends V3.UnionStruct<any[]>>(
    struct: TStruct,
    guard: TypeGuard<V3.FromUnionStruct<TStruct>>
): typeof guard
export function setStructMetadata<TStruct extends V3.IntersectionStruct<any[]>>(
    struct: TStruct,
    guard: TypeGuard<V3.FromIntersectionStruct<TStruct>>
): typeof guard

export function setStructMetadata<T>(
    struct:
        | V3.PrimitiveStruct
        | V3.NullStruct
        | V3.UndefinedStruct
        | V3.StringStruct
        | V3.NumberStruct
        | V3.BigIntStruct
        | V3.BooleanStruct
        | V3.SymbolStruct
        | V3.ObjectStruct<any>
        | V3.RecordStruct<any, any>
        | V3.ArrayStruct<any>
        | V3.TupleStruct<any>
        | V3.UnionStruct<any>
        | V3.IntersectionStruct<any>
        | V3.ClassInstanceStruct<any>
        | V3.EnumStruct<any>
        | V3.AnyStruct
        | V3.GenericStruct<T>,
    guard: TypeGuard<T>
): typeof guard {
    return setMetadata(__metadata__, struct, guard)
}
