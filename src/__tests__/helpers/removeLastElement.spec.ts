import { removeLastElement } from '../../helpers'

describe('removeLastElement', () => {
    it('should remove the last element from an array', () => {
        const array = [1, 2, 3]
        const result = removeLastElement(array)
        expect(result).toEqual([1, 2])
    })
    it('should return an empty array if the array is empty', () => {
        const array: number[] = []
        const result = removeLastElement(array)
        expect(result).toEqual([])
    })
})
