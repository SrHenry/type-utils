import type { NumberRules } from '../../rules/Number/index.ts'
import type { FluentSchema } from './FluentSchema.ts'

type Rules = Omit<typeof NumberRules, 'optional'>

export type NumberSchema = () => FluentSchema<number, Rules>
