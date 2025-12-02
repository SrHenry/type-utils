import { boolean } from '../schema/boolean'

describe('boolean', () => {
    const schema = boolean()
    const values = [
        0,
        1,
        '97',
        'hello',
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

    it('should return true if value is boolean', () => {
        expect(schema(true)).toBe(true)
        expect(schema(false)).toBe(true)
    })

    it('should return false if value is not boolean', () => {
        for (const value of values) expect(schema(value)).toBe(false)
    })

    it('should have an optional method embeded in the schema', () => {
        expect(boolean()).toHaveProperty('optional')
        expect(typeof boolean().optional).toBe('function')

        const schema = boolean().optional()

        expect(typeof schema).toBe('function')
    })

    it('should return true if value is boolean or undefined', () => {
        const schema = boolean().optional()

        expect(schema(true)).toBe(true)
        expect(schema(false)).toBe(true)
        expect(schema(undefined)).toBe(true)
    })

    it('should return false if value is not boolean when optional schema', () => {
        for (const value of values.filter(v => v !== undefined)) expect(schema(value)).toBe(false)
    })
})
