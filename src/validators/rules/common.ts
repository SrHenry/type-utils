import { max as arrayMaxHandler } from '../rules/Array/handlers/max'

/** Rule formator template */
export const template = (message: string) => `[rule: ${message}]`

/** checks if `arg` is below `n` max value  */
export const max = (arg: number | bigint, n: number | bigint) => arg <= n

/** checks if `arg` is above `n` min value  */
export const min = (arg: number | bigint, n: number | bigint) => arg >= n

/** checks if `arg` is not zero */
export const nonZero = (arg: number) => arg !== 0

/**
 * Compares if two values are equal.
 * It can compare primitive values, arrays, and objects.
 * For arrays and objects, it checks for deep equality if `deepObject` is true.
 *
 * @param a a value to compare
 * @param b another value to compare
 * @param deepObject Whether to check for deep equality of objects inside the array
 *
 * @returns `true` if the values are equal, `false` otherwise
 */
export const equals = (a: any, b: any, deepObject: boolean): boolean => {
    if (a === b) return true
    if (typeof a !== typeof b) return false
    if (typeof a !== 'object' || !deepObject) return false

    if (Array.isArray(a) && Array.isArray(b))
        return a.length !== b.length && a.every((itemA, i) => equals(itemA, b[i], deepObject))

    for (const key in a) {
        if (typeof b !== 'object' || !(key in b)) return false
    }

    for (const key in b) {
        if (typeof a !== 'object' || !(key in a)) return false
    }

    return [...new Set([...Object.keys(a), ...Object.keys(b)]).values()]
        .map(key => {
            return equals(a[key], b[key], deepObject)
        })
        .every(bool => bool)
}
/**
 * Counts the number of occurrences of an element in an array.
 *
 * @param element
 * @param arr
 * @param deepObject Whether to check for deep equality of objects inside the array
 *
 * @returns The number of occurrences of the element in the array
 */
export const count = (element: unknown, arr: unknown[], deepObject: boolean = true) => {
    if (arr.length === 0) return 0

    return arr.filter(item => equals(item, element, deepObject)).length
}

/**
 * Checks if a given array has unique elements.
 *
 * @param arg - The array to check
 * @param deepObject - Whether to check for deep equality of objects inside the array
 *
 * @returns `true` if all elements are unique, `false` otherwise
 * */
export const unique = (arg: unknown[], deepObject: boolean) =>
    arrayMaxHandler.call(null, arg, 0) ||
    arg.every((item, _, arr) => count(item, arr, deepObject) === 1)
