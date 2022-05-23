import { getRule } from './helpers'

export const template = (message: string) => `[rule: ${message}]`

export const max = (arg: number, n: number) => arg <= n
export const maxFormator = (n: number) => template(`max(${n})`)
export const arrayMaxFormator = (n: number) => template(`max ${n} items`)
export const stringMaxFormator = (n: number) => template(`max ${n} items`)

export const min = (arg: number, n: number) => arg >= n
export const minFormator = (n: number) => template(`min(${n})`)
export const arrayMinFormator = (n: number) => template(`min ${n} items`)
export const stringMinFormator = (n: number) => template(`min ${n} items`)

export const nonZero = (arg: number) => arg !== 0
export const nonZeroFormator = () => template(`!= 0`)

export const regexFormator = (regex: RegExp) => template(`matches ${regex}`)
export const nonEmptyFormator = () => template(`non empty`)

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
export const count = (element: unknown, arr: unknown[], deepObject: boolean = true) => {
    if (arr.length === 0) return 0

    return arr.filter(item => equals(item, element, deepObject)).length
}

export const unique = (arg: unknown[], deepObject: boolean) =>
    getRule('Array.max').call(null, arg, 0) ||
    arg.every((item, _, arr) => count(item, arr, deepObject) === 1)
export const uniqueFormator = () => template(`unique items`)
