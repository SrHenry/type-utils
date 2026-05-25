import type { TypeGuard } from '../../../TypeGuards/index.ts'
import type { ArrayRules } from '../../rules/Array/index.ts'
import type { ValidatorMap } from '../../types/index.ts'
import type { FluentSchema } from './FluentSchema.ts'
import type { StandardSchemaV1 } from '../../standard-schema/types.ts'

type Rules = Omit<typeof ArrayRules, 'optional'>

export type ArraySchema = CallableFunction & {
    <T = any>(): FluentSchema<T[], Rules>
    // biome-ignore lint/complexity/noBannedTypes: {} used as wildcard object type for overload
    (tree: {}): FluentSchema<{}[], Rules>
    <T>(tree: ValidatorMap<T> | TypeGuard<T> | StandardSchemaV1<T, T>): FluentSchema<T[], Rules>
}
