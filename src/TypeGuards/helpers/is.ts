import type { TypeGuard } from '../types/index.ts'
import type { StandardSchemaV1 } from '../../validators/standard-schema/types.ts'

import { fromStandardSchema } from '../../validators/standard-schema/fromStandardSchema.ts'
import { isNativeSchema } from '../../validators/schema/helpers/isNativeSchema.ts'
import { isStandardSchema } from '../../validators/standard-schema/isStandardSchema.ts'
export function is<Interface>(
    value: unknown,
    validator: StandardSchemaV1<Interface> | ((value: unknown) => boolean) | TypeGuard<Interface>
): value is Interface

export function is<Interface>(
    value: unknown,
    validator: ((value: unknown) => boolean) | StandardSchemaV1<Interface>
): value is Interface {
    if (isNativeSchema(validator)) {
        return (validator as (value: unknown) => boolean)(value)
    }
    if (isStandardSchema(validator)) {
        return fromStandardSchema(validator)(value)
    }
    return (validator as (value: unknown) => boolean)(value)
}
