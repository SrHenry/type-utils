import { StringRules } from '../rules/String'
import { string } from '../schema/string'

describe('string', () => {
    it('should return true if the input is a string', () => {
        expect(string()('')).toBe(true)
        expect(string()('hello')).toBe(true)
        expect(string()('123')).toBe(true)
        expect(string()('true')).toBe(true)
        expect(string()('false')).toBe(true)
        expect(string()('null')).toBe(true)
        expect(string()('undefined')).toBe(true)
        expect(string()('Symbol()')).toBe(true)
    })

    const values = [
        0,
        1,
        true,
        false,
        null,
        undefined,
        Symbol(),
        {},
        [],
        () => void 0,
        function () {
            return void 0
        },
        class {},
        new Date(),
        /a/,
        new RegExp('a'),
        new Error(),
        new Map(),
        new Set(),
        new WeakMap(),
        new WeakSet(),
        new ArrayBuffer(2),
        new Int8Array(),
        new Uint8Array(),
        new Uint8ClampedArray(),
        new Int16Array(),
        new Uint16Array(),
        new Int32Array(),
        new Uint32Array(),
        new Float32Array(),
        new Float64Array(),
        new BigInt64Array(),
        new BigUint64Array(),
        new Promise(() => void 0),
        Promise.resolve(),
        Promise.reject().catch(r => r),
        new Proxy({}, {}),
    ]

    it('should return false if the input is not a string', () => {
        for (const value of values) expect(string()(value)).toBe(false)
    })

    it('should return false if the input does not follow defined rules', () => {
        expect(string({ min: 1 })('')).toBe(false)
        expect(string({ min: 1 })('hello')).toBe(true)
        expect(string({ min: 1 })('123')).toBe(true)
        expect(string({ min: 1 })('true')).toBe(true)
        expect(string({ min: 1 })('false')).toBe(true)
        expect(string({ min: 1 })('null')).toBe(true)
        expect(string({ max: 1 })('ssssss')).toBe(false)
        expect(string({ max: 1 })('s')).toBe(true)
        expect(string({ max: 1 })('')).toBe(true)
        expect(string({ max: 1 })('hello')).toBe(false)
        expect(string({ max: 1 })('123')).toBe(false)
        expect(string({ min: 1, max: 1 })('true')).toBe(false)
        expect(string({ min: 1, max: 1 })('false')).toBe(false)
        expect(string({ min: 1, max: 1 })('null')).toBe(false)
        expect(string({ min: 1, max: 1 })('!')).toBe(true)
        expect(string({ min: 1, max: 1 })('')).toBe(false)
        expect(string({ min: 1, max: 1 })('hello')).toBe(false)
        expect(string({ min: 1, max: 5, regex: /^hel+o$/ })('123')).toBe(false)
        expect(string({ min: 1, max: 5, regex: /^hel+o$/ })('hello')).toBe(true)
        expect(string({ min: 1, max: 5, regex: /^hel+o$/ })('hello')).toBe(true)
        expect(string({ min: 1, max: 5, regex: /^hel+o$/ })('helllo')).toBe(false)
        expect(string({ min: 1, max: 5, regex: /^hel+o$/ })('hellllo')).toBe(false)
        expect(string({ min: 1, max: 5, regex: /^hel+o$/ })('true')).toBe(false)
        expect(string({ min: 1, max: 5, regex: /^hel+o$/ })('false')).toBe(false)
        expect(string({ nonEmpty: true })('')).toBe(false)

        expect(string([StringRules.min(1)])('')).toBe(false)
        expect(string([StringRules.min(1)])('hello')).toBe(true)
        expect(string([StringRules.min(1)])('123')).toBe(true)
        expect(string([StringRules.min(1)])('true')).toBe(true)
        expect(string([StringRules.min(1)])('false')).toBe(true)
        expect(string([StringRules.min(1)])('null')).toBe(true)
        expect(string([StringRules.max(1)])('ssssss')).toBe(false)
        expect(string([StringRules.max(1)])('s')).toBe(true)
        expect(string([StringRules.max(1)])('')).toBe(true)
        expect(string([StringRules.max(1)])('hello')).toBe(false)
        expect(string([StringRules.max(1)])('123')).toBe(false)
        expect(string([StringRules.min(1), StringRules.max(1)])('true')).toBe(false)
        expect(string([StringRules.min(1), StringRules.max(1)])('false')).toBe(false)
        expect(string([StringRules.min(1), StringRules.max(1)])('null')).toBe(false)
        expect(string([StringRules.min(1), StringRules.max(1)])('!')).toBe(true)
        expect(string([StringRules.min(1), StringRules.max(1)])('')).toBe(false)
        expect(string([StringRules.min(1), StringRules.max(1)])('hello')).toBe(false)
        expect(
            string([StringRules.min(1), StringRules.max(5), StringRules.regex(/^hel+o$/)])('123')
        ).toBe(false)
        expect(
            string([StringRules.min(1), StringRules.max(5), StringRules.regex(/^hel+o$/)])('hello')
        ).toBe(true)
        expect(
            string([StringRules.min(1), StringRules.max(5), StringRules.regex(/^hel+o$/)])('hello')
        ).toBe(true)
        expect(
            string([StringRules.min(1), StringRules.max(5), StringRules.regex(/^hel+o$/)])('helllo')
        ).toBe(false)
        expect(
            string([StringRules.min(1), StringRules.max(5), StringRules.regex(/^hel+o$/)])(
                'hellllo'
            )
        ).toBe(false)
        expect(
            string([StringRules.min(1), StringRules.max(5), StringRules.regex(/^hel+o$/)])('true')
        ).toBe(false)
        expect(
            string([StringRules.min(1), StringRules.max(5), StringRules.regex(/^hel+o$/)])('false')
        ).toBe(false)
        expect(string([StringRules.nonEmpty()])('')).toBe(false)
    })
})
