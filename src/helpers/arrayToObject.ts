export function arrayToObject<O>(
    array: Array<readonly [keyof O | string | symbol | number, O[keyof O] | any]>
): O
export function arrayToObject<T extends Array<readonly [string | symbol, any]>>(
    array: T
): Record<T[number][0], T[number][1]>

export function arrayToObject<O, T extends Array<readonly [string | symbol, any]>>(
    array: T
): O | Record<T[number][0], T[number][1]> {
    return array.reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {}) as
        | O
        | Record<T[number][0], T[number][1]>
}
