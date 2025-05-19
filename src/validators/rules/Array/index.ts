import { optional } from '../Optional/factories/optional'

import { max } from './factories/max'
import { min } from './factories/min'
import { unique } from './factories/unique'

export const ArrayRules = {
    min,
    max,
    unique,
    optional,
} as const

export { max, min, optional, unique }

export type ArrayRules = ReturnType<(typeof ArrayRules)[keyof typeof ArrayRules]>
