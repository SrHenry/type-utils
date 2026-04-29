import type { TypeGuard } from '../types/index.ts'
import type { StandardSchemaV1 } from '../../validators/standard-schema/types.ts'

import { StandardSchemaAdapter } from '../../di/tokens.ts'
import { createServiceResolver } from '../../container.ts'
import { TypeGuardError } from '../TypeErrors.ts'
import { __curry_param__ } from './constants.ts'
import { getMessage } from './getMessage.ts'
import { hasMessage } from './hasMessage.ts'
import { isTypeGuard } from './isTypeGuard.ts'

const _di = createServiceResolver((c) => ({
  isStandardSchema: c.resolve(StandardSchemaAdapter).isStandardSchema,
  fromStandardSchema: c.resolve(StandardSchemaAdapter).fromStandardSchema,
}))

export function ensureInterface<Interface, Instance = unknown>(
  value: Instance,
  validator: TypeGuard<Interface>
): Interface
export function ensureInterface<Interface>(
  validator: TypeGuard<Interface>
): <Instance = unknown>(value: Instance) => Interface
export function ensureInterface<Interface, Instance = unknown>(
  value: Instance,
  validator: StandardSchemaV1<Interface>
): Interface
export function ensureInterface<Interface>(
  validator: StandardSchemaV1<Interface>
): <Instance = unknown>(value: Instance) => Interface

export function ensureInterface<Interface, Instance = unknown>(
  value: Instance | ((value: unknown) => boolean) | StandardSchemaV1<Interface>,
  validator: ((value: unknown) => boolean) | StandardSchemaV1<Interface> | symbol = __curry_param__
): Interface | ((value: Instance) => Interface) {
  if (validator === __curry_param__) {
    const firstArg = value as ((value: unknown) => boolean) | StandardSchemaV1<Interface>
    if (_di.isStandardSchema(firstArg)) {
      return (_: Instance): Interface => ensureInterface(_, firstArg as StandardSchemaV1<Interface>)
    }
    return (_: Instance): Interface => ensureInterface(_, firstArg as TypeGuard)
  }

  if (_di.isStandardSchema(validator)) {
    const guard = _di.fromStandardSchema(validator as StandardSchemaV1<Interface>)

    if (!guard(value)) {
      const message = `Failed while ensuring interface type constraint of ${JSON.stringify(
        value
      )} against Standard Schema`

      throw new TypeGuardError(message, value, guard)
    }

    return value as Interface
  }

  if (!isTypeGuard(validator))
    throw new TypeGuardError(
      'Invalid validator. must be a TypeGuard (function as predicate).',
      validator,
      isTypeGuard
    )

  if (!(validator as TypeGuard<Interface>)(value)) {
    const message = `Failed while ensuring interface type constraint of ${JSON.stringify(
      value
    )} against ${hasMessage(validator) ? getMessage(validator) : JSON.stringify(validator)}`

    throw new TypeGuardError(message, value, validator)
  }

  return value
}
