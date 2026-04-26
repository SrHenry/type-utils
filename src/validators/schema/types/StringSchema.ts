import type { StringRules } from '../../rules/String/index.ts'
import type { FluentSchema } from './FluentSchema.ts'

type Rules = Omit<typeof StringRules, 'optional'>

export type StringSchema = CallableFunction & {
    (): FluentSchema<string, Rules>
    (matches: RegExp): FluentSchema<string, Rules, [...(keyof Rules)[]]>
    <T extends string>(exact: T): FluentSchema<string, Rules, [...(keyof Rules)[]]>
}
