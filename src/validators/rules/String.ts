import { keys } from './constants'
import { Optional } from './optional'

export const StringRules = {
    min: (n: number) => [keys['String.min'], [n]] as [rule: keys['String.min'], args: [n: number]],
    max: (n: number) => [keys['String.max'], [n]] as [rule: keys['String.max'], args: [n: number]],
    regex: (regex: RegExp) =>
        [keys['String.regex'], [regex]] as [rule: keys['String.regex'], args: [regex: RegExp]],
    nonEmpty: () => [keys['String.nonEmpty'], []] as [rule: keys['String.nonEmpty'], args: []],

    optional: Optional,
} as const

export const { max, min, regex, nonEmpty } = StringRules
export { Optional as optional }

export type StringRules = ReturnType<typeof StringRules[keyof typeof StringRules]>
