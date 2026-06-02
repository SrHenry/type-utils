import type { TypeGuard } from '../types/index.ts'
import type { StandardSchemaV1 } from '../../validators/standard-schema/types.ts'

import { TypeGuardError } from '../TypeErrors.ts'
import { __curry_param__ } from './constants.ts'
import { fromStandardSchema } from '../../validators/standard-schema/fromStandardSchema.ts'
import { getMessage } from './getMessage.ts'
import { hasMessage } from './hasMessage.ts'
import { isNativeSchema } from '../../validators/schema/helpers/isNativeSchema.ts'
import { isStandardSchema } from '../../validators/standard-schema/isStandardSchema.ts'
import { isTypeGuard } from './isTypeGuard.ts'

function resolveValidator<Interface>(
    validator: unknown
): TypeGuard<Interface> {
    if (isNativeSchema(validator)) return validator as TypeGuard<Interface>
    if (isStandardSchema(validator))
        return fromStandardSchema(validator as StandardSchemaV1<Interface>)
    if (isTypeGuard(validator)) return validator as TypeGuard<Interface>
    throw new TypeGuardError(
        'Invalid validator. Must be a TypeGuard (function as predicate) or StandardSchemaV1.',
        validator,
        isTypeGuard
    )
}

export function ensureInterface<Interface, Instance = unknown>(
    value: Instance,
    validator: StandardSchemaV1<Interface> | TypeGuard<Interface>
): Interface
export function ensureInterface<Interface>(
    validator: StandardSchemaV1<Interface> | TypeGuard<Interface>
): <Instance = unknown>(value: Instance) => Interface

export function ensureInterface<Interface, Instance = unknown>(
    value: Instance | ((value: unknown) => boolean) | StandardSchemaV1<Interface>,
    validator:
    | ((value: unknown) => boolean)
    | StandardSchemaV1<Interface>
    | symbol = __curry_param__
): Interface | ((value: Instance) => Interface) {
    if (validator === __curry_param__) {
        const firstArg = value as ((value: unknown) => boolean) | StandardSchemaV1<Interface>
        const guard = resolveValidator<Interface>(firstArg)
        return (_: Instance): Interface => ensureInterface(_, guard)
    }

    const guard = resolveValidator<Interface>(validator)

    if (!guard(value)) {
        const message = `Failed while ensuring interface type constraint of ${JSON.stringify(
            value
        )} against ${hasMessage(guard) ? getMessage(guard) : JSON.stringify(guard)}`

        throw new TypeGuardError(message, value, guard)
    }

    return value as Interface
}
