import { OR } from '../../../helpers'

const LARGE_ARRAY_SIZE = 10000

describe('OR', () => {
    it('should return true if any value is true', () => {
        const random = Math.max(0, Math.floor(Math.random() * LARGE_ARRAY_SIZE) - 1)

        expect(OR(true)).toBe(true)
        expect(OR(true, false)).toBe(true)
        expect(OR(false, true)).toBe(true)
        expect(OR(true, false, true)).toBe(true)
        expect(OR(true, true, false, true)).toBe(true)
        expect(OR(true, true, true, false, true)).toBe(true)
        expect(
            OR(...Array.from({ length: LARGE_ARRAY_SIZE }, (_, i) => (random === i ? true : false)))
        ).toBe(true)
    })
    it('should return false if all values are false', () => {
        expect(OR(false)).toBe(false)
        expect(OR(false, false)).toBe(false)
        expect(OR(false, false, false)).toBe(false)
        expect(OR(false, false, false, false)).toBe(false)
        expect(OR(false, false, false, false, false)).toBe(false)
        expect(OR(...Array.from({ length: LARGE_ARRAY_SIZE }, () => false))).toBe(false)
    })
})
