import { omit } from '../../omit'

describe('omit', () => {
    it('should omit the specified keys from an object', () => {
        const object = {
            a: 1,
            b: 2,
            c: 3,
            d: 4,
            e: 5,
        }
        const result = omit(object, ['a', 'c', 'e'])
        expect(result).toEqual({
            b: 2,
            d: 4,
        })
    })

    it('should return an empty object if the object is empty', () => {
        const object = {}
        const result = omit(object, ['a', 'c', 'e'] as (keyof typeof object)[])
        expect(result).toEqual({})
    })

    it('should return unmodified object if the keys are empty', () => {
        const object = {
            a: 1,
            b: 2,
            c: 3,
            d: 4,
            e: 5,
        }
        const result = omit(object, [])

        expect(result).toEqual(object)
        expect(result).toBe(object)
        expect(result === object).toBe(true)
    })

    it('should return unmodified object if all the keys are not present', () => {
        const object = {
            a: 1,
            b: 2,
            c: 3,
            d: 4,
            e: 5,
        }
        const result = omit(object, ['f', 'g', 'h'] as unknown as (keyof typeof object)[])

        expect(result).toEqual(object)
        expect(result).toBe(object)
        expect(result === object).toBe(true)
    })
})
