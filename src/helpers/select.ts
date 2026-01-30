export function select<TObject extends {}, TKey extends keyof TObject>(
    key: TKey
): (item: TObject) => TObject[TKey]
export function select<TObject extends {}, TKeys extends keyof TObject>(
    ...keys: TKeys[]
): Pick<TObject, TKeys>

export function select<TObject extends {}, TKey extends keyof TObject>(...keys: TKey[]) {
    const [key, ...rest] = keys

    if (!key) throw new Error('expected 1+ argument, given 0')

    if (rest.length > 0)
        return (item: TObject) => {
            const typeOfItem = typeof item

            if (typeOfItem !== 'object')
                throw new TypeError(`expected not null object argument, given ${typeOfItem}`)
            if (item === null) throw new TypeError(`expected not null object argument, given null`)

            return Object.fromEntries(
                Object.entries(item).filter(([key]) => keys.includes(key as TKey))
            )
        }

    return (item: TObject) => {
        if (!Object.hasOwn(item, key))
            throw new TypeError(`object has no '${String(key)}' property`)

        return item[key]
    }
}
