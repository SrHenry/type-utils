import { AND } from '../../logic'

const LARGE_ARRAY_SIZE = 10000

describe('AND', () => {
    it('should return true if all values are true', () => {
        expect(AND(true)).toBe(true)
        expect(AND(true, true)).toBe(true)
        expect(AND(true, true, true)).toBe(true)
        expect(AND(true, true, true, true)).toBe(true)
        expect(AND(true, true, true, true, true)).toBe(true)
        expect(AND(...Array.from({ length: LARGE_ARRAY_SIZE }, () => true))).toBe(true)
    })
    it('should return false if any value is false', () => {
        const random = Math.max(0, Math.floor(Math.random() * LARGE_ARRAY_SIZE) - 1)

        expect(AND(false)).toBe(false)
        expect(AND(true, false)).toBe(false)
        expect(AND(false, true)).toBe(false)
        expect(AND(true, false, true)).toBe(false)
        expect(AND(true, true, false, true)).toBe(false)
        expect(AND(true, true, true, false, true)).toBe(false)
        expect(
            AND(
                ...Array.from({ length: LARGE_ARRAY_SIZE }, (_, i) => (random === i ? false : true))
            )
        ).toBe(false)
    })
})
