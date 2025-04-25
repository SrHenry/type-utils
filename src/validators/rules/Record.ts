import { keys } from './constants'
import { Optional } from './optional'

export const RecordRules = {
    nonEmpty: () => [keys['Record.nonEmpty'], []] as [rule: keys['Record.nonEmpty'], args: []],

    optional: Optional,
} as const

export const { nonEmpty } = RecordRules
export { Optional as optional }

export type RecordRules = ReturnType<(typeof RecordRules)[keyof typeof RecordRules]>
