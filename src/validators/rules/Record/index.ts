import { optional } from '../Optional/factories/optional.ts'
import { nonEmpty } from './factories/nonEmpty.ts'

export const RecordRules = {
    nonEmpty,
    optional,
} as const

export { nonEmpty, optional }

export type RecordRule = ReturnType<(typeof RecordRules)[keyof typeof RecordRules]>
