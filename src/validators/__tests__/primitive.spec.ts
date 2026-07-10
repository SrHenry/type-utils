import { primitive } from '../schema/primitive.ts'

describe('primitive', () => {
    const schema = primitive()
    const nonPrimitives = [
        {},
        [],
        () => void 0,
        () => void 0,
        class {},
        new Date(),
        /a/,
        /a/,
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

    it('should return true if value is undefined', () => {
        expect(schema(undefined)).toBe(true)
    })

    it('should return true if value is a string', () => {
        expect(schema('hello')).toBe(true)
    })

    it('should return true if value is a number', () => {
        expect(schema(42)).toBe(true)
    })

    it('should return true if value is a bigint', () => {
        expect(schema(BigInt(9007199254740991))).toBe(true)
    })

    it('should return true if value is a boolean', () => {
        expect(schema(true)).toBe(true)
        expect(schema(false)).toBe(true)
    })

    it('should return true if value is a symbol', () => {
        expect(schema(Symbol())).toBe(true)
    })

    it('should return false if value is not a primitive', () => {
        for (const value of nonPrimitives) expect(schema(value)).toBe(false)
    })

    it('should have an optional method embedded in the schema', () => {
        expect(primitive()).toHaveProperty('optional')
        expect(typeof primitive().optional).toBe('function')

        // biome-ignore lint/suspicious/noShadow: callback destructuring — name matches outer scope intentionally
        const schema = primitive().optional()

        expect(typeof schema).toBe('function')
    })

    it('should return true if value is null or undefined when optional', () => {
        // biome-ignore lint/suspicious/noShadow: callback destructuring — name matches outer scope intentionally
        const schema = primitive().optional()

        expect(schema(null)).toBe(true)
        expect(schema(undefined)).toBe(true)
    })

    it('should return false if value is not a primitive when optional', () => {
        // biome-ignore lint/suspicious/noShadow: callback destructuring — name matches outer scope intentionally
        const schema = primitive().optional()

        for (const value of nonPrimitives) expect(schema(value)).toBe(false)
    })

    it('should have a validator method embedded in the schema', () => {
        expect(primitive()).toHaveProperty('validator')
        expect(typeof primitive().validator).toBe('function')
    })
})
