import type { TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { StandardSchemaV1 } from '../../standard-schema/types.ts'
import type { TIntersection } from './v3/index.ts'
import type { FluentSchema } from './FluentSchema.ts'

export type IntersectionSchemaEntry<T = any> = TypeGuard<T> | StandardSchemaV1<T, T>

type GetIntersectionEntryType<T> =
    T extends TypeGuard<infer U> ? U : T extends StandardSchemaV1<infer U, any> ? U : never

export type GetIntersectionEntryTypes<T extends any[]> = T extends []
    ? []
    : T extends [infer U, ...infer V]
      ? [GetIntersectionEntryType<U>, ...GetIntersectionEntryTypes<V>]
      : any[]

export type IntersectionSchema = CallableFunction & {
    <T1, T2>(
        guard1: IntersectionSchemaEntry<T1>,
        guard2: IntersectionSchemaEntry<T2>
    ): FluentSchema<T1 & T2>
    <
        TEntries extends [
            IntersectionSchemaEntry<any>,
            IntersectionSchemaEntry<any>,
            ...IntersectionSchemaEntry[],
        ],
    >(
        ...guards: TEntries
    ): FluentSchema<TIntersection<GetIntersectionEntryTypes<TEntries>>>
}
