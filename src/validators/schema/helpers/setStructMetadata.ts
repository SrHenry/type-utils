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
export function setStructMetadata<TStruct extends V3.UnionStruct<any[]>>(
    struct: TStruct,
    guard: TypeGuard<V3.FromUnionStruct<TStruct>>
): typeof guard
export function setStructMetadata<TStruct extends V3.IntersectionStruct<any[]>>(
    struct: TStruct,
    guard: TypeGuard<V3.FromIntersectionStruct<TStruct>>
): typeof guard
// export function enpipeSchemaStructIntoGuard<T>(
//     struct: BaseStruct<Generics.BaseTypes, T>,
//     guard: TypeGuard<T>
// ): typeof guard

export function setStructMetadata<T>(
    struct: V3.GenericStruct<T> | V3.RecordStruct<any, any>,
    guard: TypeGuard<T>
): typeof guard {
    return setMetadata(__metadata__, struct, guard)
}
