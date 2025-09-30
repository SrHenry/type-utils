import { arrayToObject } from '../arrayToObject'

describe('arrayToObject', () => {
    it("should return an object with the keys and values of the key-value array's array", () => {
        expect(
            arrayToObject([
                ['a', 1],
                ['b', 2],
            ])
        ).toEqual({ a: 1, b: 2 })
        expect(
            arrayToObject([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ])
        ).toEqual({ a: 1, b: 2, c: 3 })
        expect(
            arrayToObject([
                ['a', 1],
                ['b', 2],
                ['c', 3],
                ['d', 4],
            ])
        ).toEqual({
            a: 1,
            b: 2,
            c: 3,
            d: 4,
        })
        expect(
            arrayToObject([
                ['a', 1],
                ['b', 2],
                ['c', 3],
                ['d', 4],
                ['e', 5],
            ])
        ).toEqual({
            a: 1,
            b: 2,
            c: 3,
            d: 4,
            e: 5,
        })
    })
})
