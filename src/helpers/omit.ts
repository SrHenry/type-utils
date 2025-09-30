import { arrayToObject } from './arrayToObject'

export function omit<T extends {}, K extends (keyof T)[]>(from: T, keys: K): Omit<T, K[number]> {
    if (keys.length === 0 || keys.every(key => !(key in <object>from)))
        return from as Omit<T, K[number]>

    return arrayToObject(Object.entries(from).filter(([key]) => !keys.includes(key)))
}
