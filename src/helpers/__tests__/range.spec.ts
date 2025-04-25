import { range } from '../range'

describe('range', () => {
    it('should return a valid generator to use with for..of loop as a (crescent) range to iterate over', () => {
        const generator1 = range(5)
        const generator2 = range(5, 20)

        expect([...generator1]).toEqual([0, 1, 2, 3, 4])
        expect([...generator2]).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    })

    it('should return a valid generator to use with for..of loop as a (crescent) range to iterate over with differing steps', () => {
        const generator3 = range(0, 10, 2)
        const generator4 = range(5, 20, 3)

        expect([...generator3]).toEqual([0, 2, 4, 6, 8, 10])
        expect([...generator4]).toEqual([5, 8, 11, 14, 17, 20])
    })

    it('should return a valid generator to use with for..of loop as a decrescent range to iterate over', () => {
        const generator3 = range(-6)
        const generator4 = range(3, -4)
        const generator5 = range(10, 1)

        expect([...generator3]).toEqual([0, -1, -2, -3, -4, -5])
        expect([...generator4]).toEqual([3, 2, 1, 0, -1, -2, -3, -4])
        expect([...generator5]).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    })

    it('should return a valid generator to use with for..of loop as a decrescent range to iterate over with differing steps', () => {
        const generator6 = range(10, 1, -2)
        const generator7 = range(20, 5, -3)

        expect([...generator6]).toEqual([10, 8, 6, 4, 2])
        expect([...generator7]).toEqual([20, 17, 14, 11, 8, 5])
    })

    it('should behave the same wether the step is positive or negative', () => {
        const generator8 = range(10, 1, 2)
        const generator9 = range(10, 1, -2)
        const generator10 = range(1, 10, 2)
        const generator11 = range(1, 10, -2)

        expect([...generator8]).toEqual([...generator9])
        expect([...generator10]).toEqual([...generator11])
    })

    it('should return a valid generator to use with for..of loop as a range to iterate over with a map function', () => {
        const generator12 = range(1, 5, i => i * 2)
        const generator13 = range(1, 5, i => `== ${i * 3} ==`)

        expect([...generator12]).toEqual([2, 4, 6, 8, 10])
        expect([...generator13]).toEqual(['== 3 ==', '== 6 ==', '== 9 ==', '== 12 ==', '== 15 =='])
    })

    it('should return a valid generator to use with for..of loop as a range to iterate over with a map function and differing steps', () => {
        const generator14 = range(1, 5, i => i * 2, 2)
        const generator15 = range(1, 5, i => i * 3, 3)
        const generator16 = range(1, 20, i => `== ${i * 3} ==`, 4)

        expect([...generator14]).toEqual([2, 6, 10])
        expect([...generator15]).toEqual([3, 12])
        expect([...generator16]).toEqual([
            '== 3 ==',
            '== 15 ==',
            '== 27 ==',
            '== 39 ==',
            '== 51 ==',
        ])
    })
})
