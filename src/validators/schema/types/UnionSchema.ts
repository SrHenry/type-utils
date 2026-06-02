import type { TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { StandardSchemaV1 } from '../../standard-schema/types.ts'
import type { V3 } from './index.ts'
import type { FluentSchema } from './FluentSchema.ts'

export type UnionSchemaEntry<T = any> = TypeGuard<T> | StandardSchemaV1<T, T>

type GetUnionEntryType<T> =
    T extends TypeGuard<infer U> ? U : T extends StandardSchemaV1<infer U, any> ? U : never

export type GetUnionEntryTypes<T extends any[]> = T extends []
    ? []
    : T extends [infer U, ...infer V]
      ? [GetUnionEntryType<U>, ...GetUnionEntryTypes<V>]
      : any[]

export type UnionSchema = CallableFunction & {
    <T1, T2>(guard1: UnionSchemaEntry<T1>, guard2: UnionSchemaEntry<T2>): FluentSchema<T1 | T2>
    <TEntries extends [UnionSchemaEntry<any>, UnionSchemaEntry<any>, ...UnionSchemaEntry[]]>(
        guards: TEntries
    ): FluentSchema<V3.TUnion<GetUnionEntryTypes<TEntries>>>
}
