import { NAND } from '../../logic'

const LARGE_ARRAY_SIZE = 10000

describe('NAND', () => {
    it('should return false if all values are true', () => {
        expect(NAND(true)).toBe(false)
        expect(NAND(true, true)).toBe(false)
        expect(NAND(true, true, true)).toBe(false)
        expect(NAND(true, true, true, true)).toBe(false)
        expect(NAND(true, true, true, true, true)).toBe(false)
        expect(NAND(...Array.from({ length: LARGE_ARRAY_SIZE }, () => true))).toBe(false)
    })
    it('should return true if any value is false', () => {
        const random = Math.max(0, Math.floor(Math.random() * LARGE_ARRAY_SIZE) - 1)

        expect(NAND(false)).toBe(true)
        expect(NAND(true, false)).toBe(true)
        expect(NAND(false, true)).toBe(true)
        expect(NAND(true, false, true)).toBe(true)
        expect(NAND(true, true, false, true)).toBe(true)
        expect(NAND(true, true, true, false, true)).toBe(true)
        expect(
            NAND(
                ...Array.from({ length: LARGE_ARRAY_SIZE }, (_, i) => (random === i ? false : true))
            )
        ).toBe(true)
    })
})
