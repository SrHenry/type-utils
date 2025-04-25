import { getRule } from '../../helpers'

describe('getRule', () => {
    it('should return a rule', () => {
        const arr = [1, 2, 3, 4, 5]
        const num = 50
        const str = 'hello world'

        const arrayMax = getRule('Array.max')
        const arrayMin = getRule('Array.min')
        const arrayUnique = getRule('Array.unique')

        const numberMax = getRule('Number.max')
        const numberMin = getRule('Number.min')
        const numberNonZero = getRule('Number.nonZero')

        const stringMax = getRule('String.max')
        const stringMin = getRule('String.min')
        const stringNonEmpty = getRule('String.nonEmpty')
        const stringRegex = getRule('String.regex')

        const recordNonEmpty = getRule('Record.nonEmpty')

        // Check if the rules are functions
        expect(arrayMax).toBeInstanceOf(Function)
        expect(arrayMin).toBeInstanceOf(Function)
        expect(arrayUnique).toBeInstanceOf(Function)

        expect(numberMax).toBeInstanceOf(Function)
        expect(numberMin).toBeInstanceOf(Function)
        expect(numberNonZero).toBeInstanceOf(Function)

        expect(stringMax).toBeInstanceOf(Function)
        expect(stringMin).toBeInstanceOf(Function)
        expect(stringNonEmpty).toBeInstanceOf(Function)
        expect(stringRegex).toBeInstanceOf(Function)

        expect(recordNonEmpty).toBeInstanceOf(Function)

        // Check if the rules return the expected results
        expect(arrayMax(arr, 10)).toBe(true)
        expect(arrayMax(arr, 4)).toBe(false)

        expect(arrayMin(arr, 2)).toBe(true)
        expect(arrayMin(arr, 6)).toBe(false)

        expect(arrayUnique(arr, false)).toBe(true)
        expect(arrayUnique(arr, true)).toBe(true)
        expect(arrayUnique([1, 1, 1, 1, 1], false)).toBe(false)
        expect(arrayUnique([1, 1, 1, 1, 1], true)).toBe(false)
        expect(arrayUnique([{ foo: true }, { foo: true }], false)).toBe(true)
        expect(arrayUnique([{ foo: true }, { foo: true }], true)).toBe(false)

        expect(numberMax(num, 100)).toBe(true)
        expect(numberMax(num, 40)).toBe(false)

        expect(numberMin(num, 40)).toBe(true)
        expect(numberMin(num, 100)).toBe(false)

        expect(numberNonZero(num)).toBe(true)
        expect(numberNonZero(0)).toBe(false)

        expect(stringMax(str, 20)).toBe(true)
        expect(stringMax(str, 10)).toBe(false)

        expect(stringMin(str, 10)).toBe(true)
        expect(stringMin(str, 20)).toBe(false)

        expect(stringNonEmpty(str)).toBe(true)
        expect(stringNonEmpty('')).toBe(false)

        expect(stringRegex(str, /hello/)).toBe(true)
        expect(stringRegex(str, /world/)).toBe(true)
        expect(stringRegex(str, /foo/)).toBe(false)

        expect(recordNonEmpty({ foo: true, bar: false })).toBe(true)
        expect(recordNonEmpty({})).toBe(false)
    })
})
