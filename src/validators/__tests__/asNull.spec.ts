import { asNull } from '../schema/asNull'

describe('asNull', () => {
    const schema = asNull()
    const values = [
        0,
        1,
        '97',
        'hello',
        true,
        false,
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

    it('should return true if value is null', () => {
        expect(schema(null)).toBe(true)
    })
    it('should return false if falue is not null', () => {
        for (const value of values) expect(schema(value)).toBe(false)
    })

    it('should have an optional method embeded in the schema', () => {
        expect(asNull()).toHaveProperty('optional')
        expect(typeof asNull().optional).toBe('function')

        const schema = asNull().optional()

        expect(typeof schema).toBe('function')
    })

    it('should return true if value is null or undefined', () => {
        const schema = asNull().optional()

        expect(schema(null)).toBe(true)
        expect(schema(undefined)).toBe(true)
    })

    it('should return false if value is not null or undefined', () => {
        const schema = asNull().optional()

        for (const value of values.filter(v => v !== undefined)) expect(schema(value)).toBe(false)
    })
})
