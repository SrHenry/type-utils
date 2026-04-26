import { __curry_param__ } from './constants'
import { hasOwnMetadata } from './metadataStore'

export function hasMetadata<K extends string | symbol, T>(key: K, from: T): boolean
export function hasMetadata<K extends string | symbol>(key: K): <T>(from: T) => boolean
export function hasMetadata<K extends string | symbol, T>(
	key: K,
	from: Object | typeof __curry_param__ = __curry_param__
): boolean | ((from: T) => boolean) {
	if (from === __curry_param__) return (from: T): boolean => hasMetadata(key, from)

	if (from === null || typeof from === 'undefined') return false

	return hasOwnMetadata(key, from as object)
}
