import type { GetTypeGuard, TypeGuard } from '../types/index.ts'
import { __curry_param__ } from './constants.ts'
import { getOwnMetadata } from './metadataStore.ts'
import { isTypeGuard } from './isTypeGuard.ts'

export function getMetadata<T extends string | symbol, U>(key: T, from: U): any | undefined
export function getMetadata<T extends string | symbol, U, V extends TypeGuard>(
	key: T,
	from: U,
	schema: V
): GetTypeGuard<V> | undefined
export function getMetadata<T extends string | symbol>(
	key: T
): {
	<U>(from: U): any | undefined
	<U, V extends TypeGuard>(from: U, schema: V): any | undefined
}

export function getMetadata<T extends string | symbol, U, V extends TypeGuard>(
	key: T,
	from?: U,
	schema?: V
): GetTypeGuard<V> | undefined

export function getMetadata(
	key: string | symbol,
	from: Object | symbol = __curry_param__,
	schema?: TypeGuard
): unknown | undefined {
	if (from === __curry_param__)
		return (from: Object, schema?: TypeGuard): unknown => getMetadata(key, from, schema)

	const metadata = getOwnMetadata(key, from as object)

	if (isTypeGuard(schema) && !schema(metadata)) return void 0

	return metadata
}
