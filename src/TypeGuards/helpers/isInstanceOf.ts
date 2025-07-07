import { ConstructorSignature } from '../types'
import { __curry_param__ } from './constants'

export function isInstanceOf<Instance, Constructor extends ConstructorSignature>(
    value: Instance,
    type: Constructor
): value is InstanceType<Constructor>
export function isInstanceOf<Constructor extends ConstructorSignature>(
    type: Constructor
): <Instance>(value: Instance) => value is InstanceType<Constructor>

export function isInstanceOf<Instance, Constructor extends ConstructorSignature>(
    value_or_type: Instance | Constructor,
    type: Constructor | symbol = __curry_param__
): (<Instance>(value: Instance) => value is InstanceType<Constructor>) | boolean {
    if (type === __curry_param__)
        return (value: unknown): value is InstanceType<Constructor> =>
            isInstanceOf(value, <Constructor>value_or_type)

    return value_or_type instanceof <Constructor>type
}
