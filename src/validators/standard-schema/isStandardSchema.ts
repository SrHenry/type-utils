import type { StandardSchemaV1 } from './types.ts'

export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
  if (value === null || value === undefined) return false

  if (typeof value !== 'object') return false

  if (!('~standard' in value)) return false

  const standard = (value as StandardSchemaV1)['~standard']
  return typeof standard?.validate === 'function'
}
