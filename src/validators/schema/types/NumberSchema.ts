import type { NumberRules } from '../../rules/Number'
import type { FluentSchema } from './FluentSchema'

type Rules = Omit<typeof NumberRules, 'optional'>

export type NumberSchema = () => FluentSchema<number, Rules>
