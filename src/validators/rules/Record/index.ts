import { optional } from '../Optional/factories/optional'
import { nonEmpty } from './factories/nonEmpty'

export const RecordRules = {
    nonEmpty,
    optional,
} as const

export { nonEmpty, optional }

export type RecordRule = ReturnType<(typeof RecordRules)[keyof typeof RecordRules]>
