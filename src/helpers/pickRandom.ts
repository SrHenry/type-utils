import { random } from './random'

/** Picks a random element from an array and removes it from the array */
export function pickRandom<T>(from: T[]): T {
    if (!Array.isArray(from)) throw new Error('value must be an array')

    const index = random(from.length)
    const element = from[index]!

    from.splice(index, 1)

    return element
}
