import { XNOR } from '../../logic'

const LARGE_ARRAY_SIZE = 10000

describe('XNOR', () => {
    it('should return true if two or more values are true or all values are false', () => {
        expect(XNOR(false)).toBe(true)
        expect(XNOR(true, true)).toBe(true)
        expect(XNOR(false, false)).toBe(true)
        expect(XNOR(true, true, true)).toBe(true)
        expect(XNOR(false, false, false)).toBe(true)
        expect(XNOR(true, false, true)).toBe(true)
        expect(XNOR(true, true, false, true)).toBe(true)
        expect(XNOR(false, true, true, false)).toBe(true)
        expect(XNOR(true, false, true, false, true)).toBe(true)
        expect(XNOR(false, false, false, false, false)).toBe(true)
        expect(XNOR(...Array.from({ length: LARGE_ARRAY_SIZE }, () => true))).toBe(true)
        expect(XNOR(...Array.from({ length: LARGE_ARRAY_SIZE }, () => false))).toBe(true)
    })
    it('should return false if exactly one value is true', () => {
        const random = Math.max(0, Math.floor(Math.random() * LARGE_ARRAY_SIZE) - 1)

        expect(XNOR(true)).toBe(false)
        expect(XNOR(false, true)).toBe(false)
        expect(XNOR(true, false)).toBe(false)
        expect(XNOR(false, false, true)).toBe(false)
        expect(XNOR(true, false, false, false)).toBe(false)
        expect(XNOR(false, true, false, false, false)).toBe(false)
        expect(
            XNOR(
                ...Array.from({ length: LARGE_ARRAY_SIZE }, (_, i) => (random === i ? true : false))
            )
        ).toBe(false)
    })
})
