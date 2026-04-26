import type { TypeGuard } from '../../../TypeGuards/index.ts'
import type { ArrayRules } from '../../rules/Array/index.ts'
import type { ValidatorMap } from '../../types/index.ts'
import type { FluentSchema } from './FluentSchema.ts'

type Rules = Omit<typeof ArrayRules, 'optional'>

export type ArraySchema = CallableFunction & {
    <T = any>(): FluentSchema<T[], Rules>
    <T>(schema: TypeGuard<T>): FluentSchema<T[], Rules>
    (tree: {}): FluentSchema<{}[], Rules>
    <T>(tree: ValidatorMap<T>): FluentSchema<T[], Rules>
}
