import { NOT } from '../../logic'

describe('NOT', () => {
    it('should return true if the value is false and vice-versa', () => {
        expect(NOT(true)).toBe(false)
        expect(NOT(false)).toBe(true)
    })
})
