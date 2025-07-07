import { __curry_param__ } from './constants'

export function setMetadata<U>(key: string | symbol, metadata: unknown, into: U): U
export function setMetadata(key: string | symbol, metadata: unknown): <U>(into: U) => U
export function setMetadata(key: string | symbol): {
    <U>(metadata: unknown, into: U): U
    <U>(metadata: unknown): (into: U) => U
}

export function setMetadata(
    key: string | symbol,
    metadata: unknown | symbol = __curry_param__,
    into: Object | Symbol = __curry_param__
): Object {
    if (into === __curry_param__) {
        if (metadata === __curry_param__)
            return (metadata: unknown, into: Object | symbol = __curry_param__) => {
                if (into === __curry_param__)
                    return (into: Object) => setMetadata(key, metadata, into)

                return setMetadata(key, metadata, into)
            }

        return (into: Object): Object => setMetadata(key, metadata, into)
    }

    try {
        Reflect.defineMetadata(key, metadata, into)
    } finally {
        return into
    }
}
