const EMPTY = Symbol('join:empty')
export function join(separator: string): (array: any[]) => string
export function join(separator: string, array: any[]): string

export function join(separator: string, array: any[] | symbol = EMPTY) {
    if (array === EMPTY) return (array: any[]) => join(separator, array)

    if (!Array.isArray(array)) throw new TypeError('value must be array')

    return array.join(separator)
}
