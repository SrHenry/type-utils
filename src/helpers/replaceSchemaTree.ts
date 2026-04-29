import type { TypeGuard } from '../TypeGuards/types/index.ts'
import type { GenericStruct, V3 } from '../validators/schema/types/index.ts'

import { TypeGuardTagService, StructMetadataService, SchemaFactory } from '../di/tokens.ts'
import { createServiceResolver } from '../container.ts'

const _di = createServiceResolver((c) => ({
  isTypeGuard: c.resolve(TypeGuardTagService).isTypeGuard,
  getStructMetadata: c.resolve(StructMetadataService).getStructMetadata,
  object: c.resolve(SchemaFactory).object,
}))

export type ReplacedKeysTree<
  TOrigin extends {},
  TReplace extends Partial<Record<keyof TOrigin, any>>,
> = {
  [K in keyof TReplace]: K extends keyof TReplace
  ? TypeGuard<TReplace[K]>
  : K extends keyof TOrigin
  ? TypeGuard<TOrigin[K]>
  : never
}

export function replaceSchemaTree<
  TOrigin extends {},
  TReplace extends Partial<Record<keyof TOrigin, any>>,
>(
  schema: TypeGuard<TOrigin>,
  tree: ReplacedKeysTree<TOrigin, TReplace>
): TypeGuard<Prettify<Omit<TOrigin, keyof TReplace> & TReplace>> {
  if (!_di.isTypeGuard<TOrigin>(schema)) throw new TypeError('schema must be a type guard')

  const _struct = _di.getStructMetadata(schema) as V3.StructType

  if (_struct.type !== 'object' || !('tree' in _struct))
    throw new TypeError(`\`${schema.name}\` must be an object schema`)

  const baseTree = Object.entries<Record<string, GenericStruct>>(
    _struct.tree as Record<string, GenericStruct>
  )
    .filter(([key]) => !(key in tree))
    .map(([key, value]) => ({
      [key]: value.schema,
    })) as unknown as Record<string, TypeGuard>[]

  Object.entries<Record<string, TypeGuard>>(tree).forEach(([k, v]) => baseTree.push({ [k]: v }))

  const newTree = baseTree.reduce(
    (o, branch) => Object.assign(o, branch),
    {} as Record<string, TypeGuard>
  )

  return _di.object(newTree) as TypeGuard<Prettify<Omit<TOrigin, keyof TReplace> & TReplace>>
}
