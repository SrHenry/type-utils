import { arrayToObject } from '../arrayToObject'

type ExtractKey<K> = K extends object ? keyof K : K
type ExtractValue<T, M> = M extends keyof T
    ? T[M]
    : M extends { [K in keyof M]: (from: any) => infer R }
      ? R
      : never

type KeyMapperItem<T> = {
    [K in keyof T]: K | { [P in K]: (from: T[P]) => unknown }
}[keyof T]

export function pick<T extends object, TKeys extends [KeyMapperItem<T>, ...KeyMapperItem<T>[]]>(
    ...keyMappers: TKeys
): (item: T) => {
    [M in TKeys[number] as ExtractKey<M> & keyof T]: ExtractValue<T, M>
}

export function pick(...keys_or_mappers: any[]) {
    const keys = keys_or_mappers.filter(e => typeof e === 'string')
    const mappers = new Map<string, (from: any) => any>()

    for (const mapper of keys_or_mappers.filter(
        (e: any): e is { [k: string]: (from: any) => any } => typeof e !== 'string'
    )) {
        Object.entries(mapper).forEach(([k, v]) => mappers.set(k, v))
    }

    return (item: any, _i?: number, _array?: any[]) => {
        let firstMissingKeyIndex = -1
        if ((firstMissingKeyIndex = keys.findIndex(key => !(key in item))) !== -1)
            throw new TypeError(`object has no '${keys[firstMissingKeyIndex]}' property`)

        return arrayToObject(
            keys
                .concat(...mappers.keys())
                .map(key => [key, keys.includes(key) ? item[key] : mappers.get(key)?.(item[key])])
        )
    }
}
