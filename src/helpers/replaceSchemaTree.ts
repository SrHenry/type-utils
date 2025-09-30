import type { TypeGuard } from '../TypeGuards/types'
import type { GenericStruct } from '../validators/schema/types'

import { isTypeGuard } from '../TypeGuards/helpers/isTypeGuard'
import { getStructMetadata } from '../validators/schema/helpers/getStructMetadata'
import { object } from '../validators/schema/object'

export type ReplacedKeysTree<
    TOrigin extends {},
    TReplace extends Partial<Record<keyof TOrigin, any>>
> = {
    [K in keyof TReplace]: K extends keyof TReplace
        ? TypeGuard<TReplace[K]>
        : K extends keyof TOrigin
        ? TypeGuard<TOrigin[K]>
        : never
}

/**
 * Replaces key guards in a (object) schema tree partially.
 *
 * @template TOrigin The original schema type.
 * @template TReplace The replacement schema type.
 *
 * @param schema The original schema.
 * @param tree The replacement schema tree.
 *
 * @returns The modified schema with replaced key guards.
 *
 * @throws {TypeError} If the schema is not a type guard or if the schema is not an object schema.
 */
export function replaceSchemaTree<
    TOrigin extends {},
    TReplace extends Partial<Record<keyof TOrigin, any>>
>(
    schema: TypeGuard<TOrigin>,
    tree: ReplacedKeysTree<TOrigin, TReplace>
): TypeGuard<Prettify<Omit<TOrigin, keyof TReplace> & TReplace>> {
    if (!isTypeGuard<TOrigin>(schema)) throw new TypeError('schema must be a type guard')

    const _struct = getStructMetadata(schema)

    if (_struct.type !== 'object')
        throw new TypeError(`\`${schema.name}\` must be an object schema`)

    const baseTree = Object.entries<Record<string, GenericStruct>>(_struct.tree)
        .filter(([key]) => !(key in tree))
        .map(([key, value]) => ({
            [key]: value.schema,
        })) as unknown as Record<string, TypeGuard>[]

    Object.entries<Record<string, TypeGuard>>(tree).forEach(([k, v]) => baseTree.push({ [k]: v }))

    const newTree = baseTree.reduce(
        (o, branch) => Object.assign(o, branch),
        {} as Record<string, TypeGuard>
    )

    return object(newTree) as TypeGuard<Prettify<Omit<TOrigin, keyof TReplace> & TReplace>>
}
