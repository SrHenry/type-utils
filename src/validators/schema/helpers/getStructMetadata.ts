import type { Generics } from '../../../Generics'
import type { TypeGuard } from '../../../TypeGuards/types'
import type { V3 } from '../types'

import { getMetadata } from '../../../TypeGuards/helpers/getMetadata'
import { __metadata__ } from './constants'

// export function getStructMetadata(guard: TypeGuard<any>): V3.AnyStruct | V3.CustomStruct<any>
// export function getStructMetadata(
//     guard: TypeGuard<undefined>
// ): V3.UndefinedStruct | V3.CustomStruct<undefined>
// export function getStructMetadata(guard: TypeGuard<null>): V3.NullStruct | V3.CustomStruct<null>
// export function getStructMetadata(
//     guard: TypeGuard<boolean>
// ): V3.BooleanStruct | V3.CustomStruct<boolean>
// export function getStructMetadata(
//     guard: TypeGuard<number>
// ): V3.NumberStruct | V3.CustomStruct<number>
// export function getStructMetadata(
//     guard: TypeGuard<bigint>
// ): V3.BigIntStruct | V3.CustomStruct<bigint>
// export function getStructMetadata(
//     guard: TypeGuard<string>
// ): V3.StringStruct | V3.CustomStruct<string>
// export function getStructMetadata(
//     guard: TypeGuard<symbol>
// ): V3.SymbolStruct | V3.CustomStruct<symbol>
// export function getStructMetadata<TEnum extends [...Generics.PrimitiveType[]]>(
//     guard: TypeGuard<TEnum>
// ): V3.EnumStruct<TEnum[number]> | V3.CustomStruct<TEnum[number]>
// export function getStructMetadata<T extends {}>(
//     guard: TypeGuard<T>
// ):
//     | V3.ObjectStruct<T>
//     | V3.ClassInstanceStruct<T>
//     | V3.RecordStruct<keyof T, T[keyof T]>
//     | V3.CustomStruct<T>
// export function getStructMetadata<U>(
//     guard: TypeGuard<U[]>
// ): V3.ArrayStruct<U> | V3.CustomStruct<U[]>
// export function getStructMetadata<T extends readonly [...any[]]>(
//     guard: TypeGuard<T>
// ): V3.TupleStruct<T> | V3.CustomStruct<T>
// export function getStructMetadata<K extends PropertyKey, V>(
//     guard: TypeGuard<Record<K, V>>
// ): V3.RecordStruct<K, V> | V3.CustomStruct<Record<K, V>>

// export function getStructMetadata<T extends any[]>(
//     guard: TypeGuard<V3.TUnion<T>>
// ): V3.UnionStruct<V3.TUnion<T>> | V3.CustomStruct<V3.TUnion<T>>
// export function getStructMetadata<T extends any[]>(
//     guard: TypeGuard<V3.TIntersection<T>>
// ): V3.IntersectionStruct<V3.TIntersection<T>> | V3.CustomStruct<V3.TIntersection<T>>

export function getStructMetadata<T>(
    guard: TypeGuard<T>
): V3.GenericStruct<T> | V3.AnyStruct | V3.CustomStruct<T>
export function getStructMetadata(guard: unknown): V3.AnyStruct

export function getStructMetadata(
    guard: TypeGuard<any>
): V3.StructType | V3.AnyStruct | V3.CustomStruct<unknown>

export function getStructMetadata(
    guard:
        | TypeGuard<any>
        | TypeGuard<undefined>
        | TypeGuard<null>
        | TypeGuard<boolean>
        | TypeGuard<number>
        | TypeGuard<bigint>
        | TypeGuard<string>
        | TypeGuard<symbol>
        | TypeGuard<Generics.PrimitiveType>
        | TypeGuard<Generics.PrimitiveType[]>
        | TypeGuard<PropertyKey[]>
        | TypeGuard<Exclude<object, null>>
        | TypeGuard<any[]>
        | TypeGuard<readonly [...any[]]>
        | TypeGuard<Record<PropertyKey, any>>
        | unknown
):
    | V3.GenericStruct<any>
    | V3.AnyStruct
    | V3.UndefinedStruct
    | V3.NullStruct
    | V3.BooleanStruct
    | V3.NumberStruct
    | V3.BigIntStruct
    | V3.StringStruct
    | V3.SymbolStruct
    | V3.EnumStruct<Generics.PrimitiveType>
    // | V3.EnumStruct<Generics.PrimitiveType>
    | V3.ObjectStruct<any>
    | V3.ClassInstanceStruct<any>
    | V3.ArrayStruct<any>
    | V3.TupleStruct<any>
    | V3.RecordStruct<PropertyKey, any>
    | V3.UnionStruct<any>
    | V3.IntersectionStruct<any>
    | V3.StructType
    | V3.CustomStruct<any> {
    return (
        getMetadata(__metadata__, guard) ?? {
            type: 'any',
            optional: false,
            schema: guard,
        }
    )
}
