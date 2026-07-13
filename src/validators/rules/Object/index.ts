import { strict } from './factories/strict.ts'

export const ObjectRules = { strict } as const

export { strict }

export type ObjectRule = ReturnType<(typeof ObjectRules)[keyof typeof ObjectRules]>
