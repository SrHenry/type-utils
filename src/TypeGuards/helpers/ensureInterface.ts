import { TypeGuardError } from '../TypeErrors'
import { TypeGuard } from '../types'
import { __curry_param__ } from './constants'
import { getMessage } from './getMessage'
import { hasMessage } from './hasMessage'
import { isTypeGuard } from './isTypeGuard'

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
            'Invalid validator. It must be a TypeGuard (function as predicate).',
            validator,
            isTypeGuard
        )

    if (!(validator as TypeGuard<Interface>)(value)) {
        const message = `Failed while ensuring interface type constraint of ${JSON.stringify(
            value,
            null,
            2
        )} against ${hasMessage(validator) ? getMessage(validator) : JSON.stringify(validator)}`

        throw new TypeGuardError(message, value, validator)
    }

    return value
}
