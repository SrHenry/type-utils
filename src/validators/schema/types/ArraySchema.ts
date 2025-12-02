import type { TypeGuard } from '../../../TypeGuards'
import type { ArrayRules } from '../../rules/Array'
import type { ValidatorMap } from '../../types'
import type { FluentSchema } from './FluentSchema'

type Rules = Omit<typeof ArrayRules, 'optional'>

export type ArraySchema = CallableFunction & {
    <T = any>(): FluentSchema<T[], Rules>
    <T>(schema: TypeGuard<T>): FluentSchema<T[], Rules>
    (tree: {}): FluentSchema<{}[], Rules>
    <T>(tree: ValidatorMap<T>): FluentSchema<T[], Rules>
}
