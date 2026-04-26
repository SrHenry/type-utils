import { optional } from '../Optional/factories/optional.ts'

import { max } from './factories/max.ts'
import { min } from './factories/min.ts'
import { unique } from './factories/unique.ts'

export const ArrayRules = {
    min,
    max,
    unique,
    optional,
} as const

export { max, min, optional, unique }

export type ArrayRule = ReturnType<(typeof ArrayRules)[keyof typeof ArrayRules]>
