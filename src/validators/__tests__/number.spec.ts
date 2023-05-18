import { repeat } from '../../helpers'
import { NumberRules } from '../rules'
import { number } from '../schema/number'

describe('number', () => {
    it('should return true if value is number', () => {
        expect(number()(0)).toBe(true)
        expect(number()(1)).toBe(true)
        expect(number()(-1)).toBe(true)
        expect(number()(0.1)).toBe(true)
        expect(number()(-0.1)).toBe(true)
        expect(number()(Number.MAX_SAFE_INTEGER)).toBe(true)
        expect(number()(Number.MIN_SAFE_INTEGER)).toBe(true)
        expect(number()(Number.MAX_VALUE)).toBe(true)
        expect(number()(Number.MIN_VALUE)).toBe(true)
        expect(number()(Infinity)).toBe(true)
        expect(number()(-Infinity)).toBe(true)
        expect(number()(NaN)).toBe(true)

        repeat(() => expect(number()(Math.random())).toBe(true), 10_000)
    })

    const values = [
        '97',
        'hello',
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
    it('should return false if value is not number', () => {
        for (const value of values) expect(number()(value)).toBe(false)
    })

    it('should return false if value does not follow defined rules', () => {
        expect(number({ min: 1 })(0)).toBe(false)
        expect(number({ max: 1 })(2)).toBe(false)
        expect(number({ min: 1, max: 1 })(0)).toBe(false)
        expect(number({ min: 1, max: 1 })(2)).toBe(false)
        expect(number({ min: 1, max: 1 })(0.5)).toBe(false)
        expect(number({ min: 1, max: 1 })(1.5)).toBe(false)
        expect(number({ min: 1, max: 1 })(0.999999)).toBe(false)
        expect(number({ min: 1, max: 1 })(1.000001)).toBe(false)
        expect(number({ nonZero: true })(0)).toBe(false)
        expect(number({ nonZero: true })(-0)).toBe(false)
        expect(number({ nonZero: true })(0.0)).toBe(false)
        expect(number({ nonZero: true })(-0.0)).toBe(false)
        expect(number({ nonZero: true })(0.0)).toBe(false)
        expect(number({ nonZero: true })(-0.0)).toBe(false)

        expect(number([NumberRules.min(1)])(0)).toBe(false)
        expect(number([NumberRules.max(1)])(2)).toBe(false)
        expect(number([NumberRules.min(1), NumberRules.max(1)])(0)).toBe(false)
        expect(number([NumberRules.min(1), NumberRules.max(1)])(2)).toBe(false)
        expect(number([NumberRules.min(1), NumberRules.max(1)])(0.5)).toBe(false)
        expect(number([NumberRules.min(1), NumberRules.max(1)])(1.5)).toBe(false)
        expect(number([NumberRules.min(1), NumberRules.max(1)])(0.999999)).toBe(false)
        expect(number([NumberRules.min(1), NumberRules.max(1)])(1.000001)).toBe(false)
        expect(number([NumberRules.nonZero()])(0)).toBe(false)
        expect(number([NumberRules.nonZero()])(-0)).toBe(false)
        expect(number([NumberRules.nonZero()])(0.0)).toBe(false)
        expect(number([NumberRules.nonZero()])(-0.0)).toBe(false)
        expect(number([NumberRules.nonZero()])(0.0)).toBe(false)
        expect(number([NumberRules.nonZero()])(-0.0)).toBe(false)
    })
})
