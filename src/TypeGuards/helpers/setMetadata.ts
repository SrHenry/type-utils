import { __curry_param__ } from './constants.ts'
import { defineMetadata } from './metadataStore.ts'

export function setMetadata<U>(key: string | symbol, metadata: unknown, into: U): U
export function setMetadata(key: string | symbol, metadata: unknown): <U>(into: U) => U
export function setMetadata(key: string | symbol): {
    <U>(metadata: unknown, into: U): U
    <U>(metadata: unknown): (into: U) => U
}

export function setMetadata(
    key: string | symbol,
    metadata: unknown | symbol = __curry_param__,
    into: object | symbol = __curry_param__
): object | symbol {
    if (into === __curry_param__) {
        if (metadata === __curry_param__)
            return (metadata: unknown, into: object | symbol = __curry_param__) => {
                if (into === __curry_param__)
                    return (into: object) => setMetadata(key, metadata, into)

                return setMetadata(key, metadata, into)
            }

        return (into: object): object | symbol => setMetadata(key, metadata, into)
    }

    defineMetadata(key, metadata, into as object)

    return into
}
