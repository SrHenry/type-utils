import type { TypeGuard } from '../../../TypeGuards'
import type { RecordRules } from '../../rules/Record'
import type { FluentSchema } from './FluentSchema'

type Rules = Omit<typeof RecordRules, 'optional'>

export type RecordSchema = CallableFunction & {
    (): FluentSchema<Record<string, any>, Rules>
    <K extends string | number | symbol, V>(
        keySchema: TypeGuard<K>,
        valueSchema: TypeGuard<V>
    ): FluentSchema<Record<K, V>, Rules>
    <K extends string | number | symbol>(keySchema: TypeGuard<K>): FluentSchema<
        Record<K, any>,
        Rules
    >
}
