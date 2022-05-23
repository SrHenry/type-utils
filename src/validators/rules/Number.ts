import { keys } from './constants'
import { Optional } from './optional'

export const NumberRules = {
    nonZero: () => [keys['Number.nonZero'], []] as [rule: keys['Number.nonZero'], args: []],
    max: (n: number) => [keys['Number.max'], [n]] as [rule: keys['Number.max'], args: [n: number]],
    min: (n: number) => [keys['Number.min'], [n]] as [rule: keys['Number.min'], args: [n: number]],

    optional: Optional,
} as const

export const { nonZero, max, min } = NumberRules
export { Optional as optional }

export type NumberRules = ReturnType<typeof NumberRules[keyof typeof NumberRules]>
