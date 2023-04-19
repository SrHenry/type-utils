import { keys } from './constants'
import { Optional } from './optional'

export const NumberRules = {
    nonZero: () => [keys['Number.nonZero'], []] as [rule: keys['Number.nonZero'], args: []],
    max: (n: number | bigint) =>
        [keys['Number.max'], [n]] as [rule: keys['Number.max'], args: [n: number | bigint]],
    min: (n: number | bigint) =>
        [keys['Number.min'], [n]] as [rule: keys['Number.min'], args: [n: number | bigint]],

    optional: Optional,
} as const

export const { nonZero, max, min } = NumberRules
export { Optional as optional }

export type NumberRules = ReturnType<typeof NumberRules[keyof typeof NumberRules]>
