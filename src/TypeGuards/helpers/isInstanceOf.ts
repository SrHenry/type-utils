import { setStructMetadata } from '../../validators/schema/helpers/setStructMetadata.ts'
import type { V3 } from '../../validators/schema/types/v3/index.ts'
import type { ConstructorSignature } from '../types/index.ts'
import { __curry_param__ } from './constants.ts'

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
    // biome-ignore lint/suspicious/noShadow: type param in return type signature intentionally reuses Instance
): (<Instance>(value: Instance) => value is InstanceType<Constructor>) | boolean {
    if (type === __curry_param__) {
        const guard = (val: unknown): val is InstanceType<Constructor> =>
            isInstanceOf(val, <Constructor>value_or_type)

        return setStructMetadata<V3.ClassInstanceStruct<any>>(
            {
                type: 'object',
                tree: {},
                optional: false,
                constructor: <Constructor>value_or_type,
                className: (<Constructor>value_or_type).name,
                schema: guard,
                rules: [],
            },
            guard
        )
    }

    return value_or_type instanceof <Constructor>type
}
