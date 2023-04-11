import { MapFn, TMapFn } from '../../types'

const EMPTY = Symbol('map:empty')
export function map<T, U>(fn: TMapFn<T, U>): (array: T[]) => U[]
export function map<T, U>(fn: TMapFn<T, U>, array: T[]): U[]

export function map(fn: MapFn, array: any[] | symbol = EMPTY) {
    if (array === EMPTY) return (array: any[]) => map(fn, array)

    if (!Array.isArray(array)) throw new TypeError('value must be array')

    return array.map(fn)
}
