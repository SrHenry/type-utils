import { optional } from '../Optional/factories/optional'
import { max } from './factories/max'
import { min } from './factories/min'
import { nonZero } from './factories/nonZero'

export const NumberRules = {
    nonZero,
    max,
    min,
    optional,
} as const

export { max, min, nonZero, optional }

export type NumberRules = ReturnType<(typeof NumberRules)[keyof typeof NumberRules]>
