import { keys } from './constants'
import { Optional } from './optional'

export const StringRules = {
    min: (n: number | bigint) =>
        [keys['String.min'], [n < 0 ? 0 : n]] as [
            rule: keys['String.min'],
            args: [n: number | bigint]
        ],
    max: (n: number | bigint) =>
        [keys['String.max'], [n < 0 ? 0 : n]] as [
            rule: keys['String.max'],
            args: [n: number | bigint]
        ],
    regex: (regex: RegExp) =>
        [keys['String.regex'], [regex]] as [rule: keys['String.regex'], args: [regex: RegExp]],
    nonEmpty: () => [keys['String.nonEmpty'], []] as [rule: keys['String.nonEmpty'], args: []],

    optional: Optional,
} as const

export const { max, min, regex, nonEmpty } = StringRules
export { Optional as optional }

export type StringRules = ReturnType<(typeof StringRules)[keyof typeof StringRules]>
