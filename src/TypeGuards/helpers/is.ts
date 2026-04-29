import type { TypeGuard } from '../types/index.ts'
import type { StandardSchemaV1 } from '../../validators/standard-schema/types.ts'

import { StandardSchemaAdapter } from '../../di/tokens.ts'
import { createServiceResolver } from '../../container.ts'

const _di = createServiceResolver((c) => ({
  isStandardSchema: c.resolve(StandardSchemaAdapter).isStandardSchema,
  fromStandardSchema: c.resolve(StandardSchemaAdapter).fromStandardSchema,
}))

export function is<Interface>(value: unknown, validator: TypeGuard<Interface>): value is Interface
export function is<Interface>(
  value: unknown,
  validator: (value: unknown) => boolean
): value is Interface
export function is<Interface>(
  value: unknown,
  validator: StandardSchemaV1<Interface>
): value is Interface

export function is<Interface>(
  value: unknown,
  validator: ((value: unknown) => boolean) | StandardSchemaV1<Interface>
): value is Interface {
  if (_di.isStandardSchema(validator)) {
    return _di.fromStandardSchema(validator)(value)
  }

  return (validator as (value: unknown) => boolean)(value)
}
