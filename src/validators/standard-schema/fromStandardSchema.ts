import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { StandardSchemaV1 } from './types.ts'

export function fromStandardSchema<Input, Output = Input>(
  schema: StandardSchemaV1<Input, Output>
): TypeGuard<Input> {
  const validate = schema['~standard'].validate

  return (value: unknown): value is Input => {
    const result = validate(value)

    if (result instanceof Promise) {
      throw new TypeError(
        'Cannot convert an async Standard Schema to a synchronous TypeGuard. ' +
        'The external schema\'s validate() method returned a Promise.'
      )
    }

    return result.success === true
  }
}
