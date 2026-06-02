import type { TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { StandardSchemaV1 } from '../../standard-schema/types.ts'
import type { V3 } from './index.ts'
import type { FluentSchema } from './FluentSchema.ts'

export type TupleSchemaEntry<T = any> = TypeGuard<T> | StandardSchemaV1<T, T>

export type TupleSchema = CallableFunction & {
    <const T extends TupleSchemaEntry[]>(schemas: T): FluentSchema<V3.TypeGuardTupleUnwrap<T>>
    <const T extends TupleSchemaEntry[]>(...schemas: T): FluentSchema<V3.TypeGuardTupleUnwrap<T>>
}
