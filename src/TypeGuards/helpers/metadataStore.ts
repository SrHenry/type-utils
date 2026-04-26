const metadataStore = new WeakMap<object, Map<string | symbol, unknown>>()

function getTargetMap(target: object): Map<string | symbol, unknown> {
	let targetMap = metadataStore.get(target)
	if (!targetMap) {
		targetMap = new Map()
		metadataStore.set(target, targetMap)
	}
	return targetMap
}

export function defineMetadata(key: string | symbol, value: unknown, target: object): void {
	getTargetMap(target).set(key, value)
}

export function getOwnMetadata(key: string | symbol, target: object): unknown {
	return metadataStore.get(target)?.get(key)
}

export function hasOwnMetadata(key: string | symbol, target: object): boolean {
	return metadataStore.get(target)?.has(key) ?? false
}
