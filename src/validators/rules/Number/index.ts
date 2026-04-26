import { optional } from '../Optional/factories/optional.ts'
import { max } from './factories/max.ts'
import { min } from './factories/min.ts'
import { nonZero } from './factories/nonZero.ts'

export const NumberRules = {
    nonZero,
    max,
    min,
    optional,
} as const

export { max, min, nonZero, optional }

export type NumberRule = ReturnType<(typeof NumberRules)[keyof typeof NumberRules]>
