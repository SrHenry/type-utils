import { optional } from '../Optional/factories/optional'
import { nonEmpty } from './factories/nonEmpty'

export const RecordRules = {
    nonEmpty,
    optional,
} as const

// export const { nonEmpty } = RecordRules
export { nonEmpty, optional }

export type RecordRules = ReturnType<(typeof RecordRules)[keyof typeof RecordRules]>
