import { getRule } from '../../helpers/getRule'

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
        const stringEmail = getRule('String.email')
        const stringUrl = getRule('String.url')

        const recordNonEmpty = getRule('Record.nonEmpty')

        const optional = getRule('optional')

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
        expect(stringEmail).toBeInstanceOf(Function)
        expect(stringUrl).toBeInstanceOf(Function)

        expect(recordNonEmpty).toBeInstanceOf(Function)

        expect(optional).toBeInstanceOf(Function)

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

        expect(stringEmail(str)).toBe(false)
        expect(stringEmail('')).toBe(false)
        expect(stringEmail('example@email.com')).toBe(true)
        expect(stringEmail('example@email')).toBe(false)
        expect(stringEmail('example@.com')).toBe(false)
        expect(stringEmail('example@[127.0.0.1]')).toBe(false)
        expect(stringEmail('example@localhost')).toBe(false)

        expect(stringUrl(str)).toBe(false)
        expect(stringUrl('')).toBe(false)
        expect(stringUrl('https://example.com')).toBe(true)
        expect(stringUrl('http://example.com')).toBe(true)
        expect(stringUrl('http://localhost')).toBe(true)
        expect(stringUrl('http://127.0.0.1')).toBe(true)
        expect(stringUrl('ftp://example.com')).toBe(true)
        expect(stringUrl('https://example.com/path/to/resource')).toBe(true)
        expect(stringUrl('https://example.com?query=param')).toBe(true)
        expect(stringUrl('https://example.com#fragment')).toBe(true)
        expect(stringUrl('https://example.com/path/to/resource?query=param#fragment')).toBe(true)
        expect(stringUrl('http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')).toBe(true)
        expect(stringUrl('http://2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(false)
        expect(stringUrl('example.com/path/to/resource')).toBe(false)
        expect(stringUrl('example.com')).toBe(false)
        expect(stringUrl('localhost')).toBe(false)
        expect(stringUrl('192.168.0.1')).toBe(false)
        expect(stringUrl('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')).toBe(false)

        expect(recordNonEmpty({ foo: true, bar: false })).toBe(true)
        expect(recordNonEmpty({})).toBe(false)

        expect(optional(void 0)).toBe(true)
        expect(optional(1)).toBe(false)
        expect(optional('')).toBe(false)
        expect(optional(null)).toBe(false)
        expect(optional({})).toBe(false)
        expect(optional([])).toBe(false)
        expect(optional(true)).toBe(false)
    })
})
