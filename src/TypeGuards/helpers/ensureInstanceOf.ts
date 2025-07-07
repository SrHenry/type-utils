import type { ConstructorSignature } from '../types'

import { TypeGuardError } from '../TypeErrors'
import { __curry_param__ } from './constants'
import { isInstanceOf } from './isInstanceOf'

export function ensureInstanceOf<Instance, Constructor extends ConstructorSignature>(
    value: Instance,
    type: Constructor
): InstanceType<Constructor>
export function ensureInstanceOf<Constructor extends ConstructorSignature>(
    type: Constructor
): <Instance>(value: Instance) => InstanceType<Constructor>

export function ensureInstanceOf<Instance, Constructor extends ConstructorSignature>(
    value: Instance | Constructor,
    type: Constructor | symbol = __curry_param__
): InstanceType<Constructor> | ((value: Instance) => InstanceType<Constructor>) {
    if (type === __curry_param__)
        return (_: Instance): InstanceType<Constructor> => ensureInstanceOf(_, <Constructor>value)

    if (!isInstanceOf(value, <Constructor>type))
        throw new TypeGuardError(
            `Value is not an instance of ${(<Constructor>type).name}`,
            value,
            type
        )

    return value
}
