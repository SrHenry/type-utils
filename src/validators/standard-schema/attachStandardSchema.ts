import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { StandardSchemaV1 } from './types.ts'

type SchemaValidateCallback = (
  value: unknown,
  guard: TypeGuard<any>,
  shouldThrow: boolean
) => StandardSchemaV1.Result<any>

let _schemaValidateCallback: SchemaValidateCallback | null = null

export const registerSchemaValidateCallback = (cb: SchemaValidateCallback): void => {
  _schemaValidateCallback = cb
}

export function attachStandardSchema<T>(guard: TypeGuard<T>): void {
  if ('~standard' in (guard as object)) return

  const standardProps: StandardSchemaV1.Props<T, T> = {
    version: 1,
    vendor: '@srhenry/type-utils',
    validate: (value: unknown): StandardSchemaV1.Result<T> => {
      if (!_schemaValidateCallback) throw new Error('Standard Schema validate callback not registered')
      return _schemaValidateCallback(value, guard, false) as StandardSchemaV1.Result<T>
    },
    types: {
      input: undefined as unknown as T,
      output: undefined as unknown as T,
    },
  }

  Object.defineProperty(guard, '~standard', {
    value: standardProps,
    writable: false,
    enumerable: false,
    configurable: false,
  })
}
