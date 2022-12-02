import { LARGE_ARRAY_SIZE } from '..'
import { NOR } from '../../../helpers'

describe('NOR', () => {
    it('should return false if any value is true', () => {
        const random = Math.max(0, Math.floor(Math.random() * LARGE_ARRAY_SIZE) - 1)

        expect(NOR(true)).toBe(false)
        expect(NOR(true, false)).toBe(false)
        expect(NOR(false, true)).toBe(false)
        expect(NOR(true, false, true)).toBe(false)
        expect(NOR(true, true, false, true)).toBe(false)
        expect(NOR(true, true, true, false, true)).toBe(false)
        expect(
            NOR(
                ...Array.from({ length: LARGE_ARRAY_SIZE }, (_, i) => (random === i ? true : false))
            )
        ).toBe(false)
    })
    it('should return true if all values are false', () => {
        expect(NOR(false)).toBe(true)
        expect(NOR(false, false)).toBe(true)
        expect(NOR(false, false, false)).toBe(true)
        expect(NOR(false, false, false, false)).toBe(true)
        expect(NOR(false, false, false, false, false)).toBe(true)
        expect(NOR(...Array.from({ length: LARGE_ARRAY_SIZE }, () => false))).toBe(true)
    })
})
