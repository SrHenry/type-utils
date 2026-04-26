import { NOT } from '../../logic/index.ts'

describe('NOT', () => {
    it('should return true if the value is false and vice-versa', () => {
        expect(NOT(true)).toBe(false)
        expect(NOT(false)).toBe(true)
    })
})
