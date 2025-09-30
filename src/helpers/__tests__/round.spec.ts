import { round } from '../round'

describe('round', () => {
    it('should round a number to the given precision', () => {
        expect(round(1.2345, 2)).toBe('1.23')
        expect(round(1.2345, 3)).toBe('1.234')
        expect(round(1.2345, 4)).toMatch(/1.234[456]/)
        expect(round(1.2345, 0)).toBe('1')
        expect(round(1.2345, -1)).toBe('0')
        expect(round(1.2345, -2)).toBe('0')
    })
})
