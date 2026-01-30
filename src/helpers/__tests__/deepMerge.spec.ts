import { deepMerge } from '../deepMerge' // adjust path!

describe('deepMerge', () => {
    test('replaces primitive values', () => {
        expect(deepMerge(1, 2)).toBe(2)
        expect(deepMerge('a', 'b')).toBe('b')
        expect(deepMerge(true, false)).toBe(false)
    })

    test('merges plain objects recursively', () => {
        const a = { x: { a: 1 }, y: 10 }
        const b = { x: { b: 2 }, z: 30 }

        const result = deepMerge(a, b)

        expect(result).toEqual({
            x: { a: 1, b: 2 },
            y: 10,
            z: 30,
        })
    })

    test('concatenates arrays', () => {
        const a = { list: [1, 2] }
        const b = { list: [3, 4] }

        const result = deepMerge(a, b)

        expect(result).toEqual({
            list: [1, 2, 3, 4],
        })
    })

    test('supports merging tuples (runtime)', () => {
        const a = { t: [1, 2] as const }
        const b = { t: [3] as const }

        const result = deepMerge(a, b)

        expect(result).toEqual({
            t: [1, 2, 3],
        })
    })

    test('supports merging readonly tuples (runtime)', () => {
        const a = { t: [1] as const }
        const b = { t: [2, 3] as const }

        const result = deepMerge(a, b)

        expect(result).toEqual({
            t: [1, 2, 3],
        })
    })

    test('merges nested objects and arrays deeply', () => {
        const a = {
            a: {
                b: {
                    list: [1],
                },
            },
        }

        const b = {
            a: {
                b: {
                    list: [2, 3],
                    c: true,
                },
            },
        }

        const result = deepMerge(a, b)

        expect(result).toEqual({
            a: {
                b: {
                    list: [1, 2, 3],
                    c: true,
                },
            },
        })
    })

    test('preserves original objects (no mutation)', () => {
        const a = { x: [1, 2], y: { n: 1 } }
        const b = { x: [3], y: { m: 2 } }

        const result = deepMerge(a, b)

        // inputs must not be mutated
        expect(a).toEqual({ x: [1, 2], y: { n: 1 } })
        expect(b).toEqual({ x: [3], y: { m: 2 } })

        expect(result).toEqual({
            x: [1, 2, 3],
            y: { n: 1, m: 2 },
        })
    })

    test('replaces non-object values when types differ', () => {
        const a = { x: 10 }
        const b = { x: { nested: true } }

        expect(deepMerge(a, b)).toEqual({
            x: { nested: true },
        })

        const a2 = { x: { nested: true } }
        const b2 = { x: 123 }

        expect(deepMerge(a2, b2)).toEqual({
            x: 123,
        })
    })

    /* ---------- TYPE-LEVEL TESTS ---------- */
    // These do not affect runtime; TS will verify them at compile time.
    // They require "ts-jest" because they rely on TS assertions.

    test('type: merges nested object types', () => {
        type A = { x: { a: number } }
        type B = { x: { b: string } }
        type M = ReturnType<typeof deepMerge<A, B>>

        const m: M = { x: { a: 1, b: 'ok' } } // should type-check
        expect(m.x.a).toBe(1)
    })

    test('type: merges tuple types', () => {
        type A = { t: readonly [1, 2] }
        type B = { t: readonly [3] }
        type M = ReturnType<typeof deepMerge<A, B>>

        const m: M = { t: [1, 2, 3] } // should type-check
        expect(m.t).toEqual([1, 2, 3])
    })

    test('type: preserves readonly tuple', () => {
        type A = { t: readonly [1] }
        type B = { t: readonly [2, 3] }
        type M = ReturnType<typeof deepMerge<A, B>>

        const m: M = { t: [1, 2, 3] } // runtime arrays are OK for readonly tuples
        expect(m.t).toEqual([1, 2, 3])
    })

    test('type: concatenates arrays not replace them', () => {
        type A = { arr: number[] }
        type B = { arr: number[] }
        type M = ReturnType<typeof deepMerge<A, B>>

        const m: M = { arr: [1, 2, 3] } // merged type number[]
        expect(Array.isArray(m.arr)).toBe(true)
    })
})
