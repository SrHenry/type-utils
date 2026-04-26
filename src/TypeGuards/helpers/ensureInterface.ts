import { TypeGuardError } from '../TypeErrors.ts'
import { TypeGuard } from '../types/index.ts'
import { __curry_param__ } from './constants.ts'
import { getMessage } from './getMessage.ts'
import { hasMessage } from './hasMessage.ts'
import { isTypeGuard } from './isTypeGuard.ts'

export function ensureInterface<Interface, Instance = unknown>(
    value: Instance,
    validator: TypeGuard<Interface>
): Interface
export function ensureInterface<Interface>(
    validator: TypeGuard<Interface>
): <Instance = unknown>(value: Instance) => Interface

export function ensureInterface<Interface, Instance = unknown>(
    value: Instance | ((value: unknown) => boolean),
    validator: ((value: unknown) => boolean) | symbol = __curry_param__
): Interface | ((value: Instance) => Interface) {
    if (validator === __curry_param__)
        return (_: Instance): Interface => ensureInterface(_, value as TypeGuard)

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
