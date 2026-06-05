import type { TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { StandardSchemaV1 } from '../../standard-schema/types.ts'
import type { TypeGuardTupleUnwrap } from './v3/index.ts'
import type { FluentSchema } from './FluentSchema.ts'

export type TupleSchemaEntry<T = any> = TypeGuard<T> | StandardSchemaV1<T, T>

export type TupleSchema = CallableFunction & {
    <const T extends TupleSchemaEntry[]>(schemas: T): FluentSchema<TypeGuardTupleUnwrap<T>>
    <const T extends TupleSchemaEntry[]>(...schemas: T): FluentSchema<TypeGuardTupleUnwrap<T>>
}
