import { keys } from './constants'
import { Optional } from './optional'

export const ArrayRules = {
    min: (n: number) => [keys['Array.min'], [n]] as [rule: keys['Array.min'], args: [n: number]],
    max: (n: number) => [keys['Array.max'], [n]] as [rule: keys['Array.max'], args: [n: number]],
    unique: (deepObject: boolean = true) =>
        [keys['Array.unique'], [deepObject]] as [
            rule: keys['Array.unique'],
            args: [deepObject: boolean]
        ],
    optional: Optional,
} as const

export const { min, max, unique } = ArrayRules
export { Optional as optional }

export type ArrayRules = ReturnType<typeof ArrayRules[keyof typeof ArrayRules]>
