import { XOR } from '../../../helpers'

const LARGE_ARRAY_SIZE = 10000

describe('XOR', () => {
    it('should return true if exactly one value is true', () => {
        const random = Math.max(0, Math.floor(Math.random() * LARGE_ARRAY_SIZE) - 1)

        expect(XOR(true)).toBe(true)
        expect(XOR(false, true)).toBe(true)
        expect(XOR(true, false)).toBe(true)
        expect(XOR(false, false, true)).toBe(true)
        expect(XOR(true, false, false, false)).toBe(true)
        expect(XOR(false, true, false, false, false)).toBe(true)
        expect(
            XOR(
                ...Array.from({ length: LARGE_ARRAY_SIZE }, (_, i) => (random === i ? true : false))
            )
        ).toBe(true)
    })
    it('should return false if two or more values are true or all values are false', () => {
        expect(XOR(false)).toBe(false)
        expect(XOR(true, true)).toBe(false)
        expect(XOR(false, false)).toBe(false)
        expect(XOR(true, true, true)).toBe(false)
        expect(XOR(false, false, false)).toBe(false)
        expect(XOR(true, false, true)).toBe(false)
        expect(XOR(true, true, false, true)).toBe(false)
        expect(XOR(false, true, true, false)).toBe(false)
        expect(XOR(true, false, true, false, true)).toBe(false)
        expect(XOR(false, false, false, false, false)).toBe(false)
        expect(XOR(...Array.from({ length: LARGE_ARRAY_SIZE }, () => true))).toBe(false)
        expect(XOR(...Array.from({ length: LARGE_ARRAY_SIZE }, () => false))).toBe(false)
    })
})
