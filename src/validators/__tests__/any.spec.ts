import { any } from '../schema/any'

describe('any', () => {
    const values = [
        0,
        1,
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

    it('should validate any value', () => {
        const schema = any()

        for (const value of values) expect(schema(value)).toBe(true)
    })

    it('should have an optional method embeded in the schema', () => {
        expect(any).toHaveProperty('optional')
        expect(typeof any.optional).toBe('function')

        const schema = any.optional()

        expect(typeof schema).toBe('function')
    })

    it('should validate any value when optional schema', () => {
        const schema = any.optional()

        for (const value of values) expect(schema(value)).toBe(true)
    })
})
