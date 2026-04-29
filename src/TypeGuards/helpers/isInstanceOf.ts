import type { V3 } from '../../validators/schema/types/index.ts'
import type { ConstructorSignature } from '../types/index.ts'

import { StructMetadataService } from '../../di/tokens.ts'
import { createServiceResolver } from '../../container.ts'
import { __curry_param__ } from './constants.ts'

const _di = createServiceResolver((c) => ({
  setStructMetadata: c.resolve(StructMetadataService).setStructMetadata,
}))

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
  if (type === __curry_param__) {
    const guard = (value: unknown): value is InstanceType<Constructor> =>
      isInstanceOf(value, <Constructor>value_or_type)

    return _di.setStructMetadata<V3.ClassInstanceStruct<any>>(
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
