import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { V3 } from '../schema/types/index.ts'
import type { StandardSchemaV1 } from './types.ts'

import { isTypeGuard } from '../../TypeGuards/helpers/isTypeGuard.ts'
import { setMessage } from '../../TypeGuards/helpers/setMessage.ts'
import { setStructMetadata } from '../schema/helpers/setStructMetadata.ts'
import { setOptionalFlag } from '../schema/helpers/optionalFlag.ts'
import { fromStandardSchema } from './fromStandardSchema.ts'
import { isStandardSchema } from './isStandardSchema.ts'

export function normalizeSchema<T>(
  schema: TypeGuard<T> | StandardSchemaV1<T, T>
): TypeGuard<T> {
  if (isTypeGuard(schema)) return schema

  if (isStandardSchema(schema)) {
    const guard = fromStandardSchema(schema)

    const vendor = (schema as StandardSchemaV1<T, T>)['~standard'].vendor

    setStructMetadata<T>(
      {
        type: 'custom',
        schema: guard,
        optional: false,
        kind: 'standard-schema-external',
        rules: [],
      } as V3.CustomStruct<T>,
      setMessage(`<${vendor}>`, guard)
    )

    if (guard(undefined)) {
      setOptionalFlag(guard)
    }

    return guard
  }

  throw new TypeError(
    `Expected a TypeGuard or StandardSchemaV1, got ${typeof schema}`
  )
}
