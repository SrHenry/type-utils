import { random } from '../random'

describe('random', () => {
    it('should return a random number between min and max', () => {
        const min = 1
        const max = 100
        for (let i = 0; i < 1000; i++) {
            const randomNum = random(min, max)

            expect(randomNum).toBeGreaterThanOrEqual(min)
            expect(randomNum).toBeLessThanOrEqual(max)
        }
    })
    it('should return a random number between 0 and n', () => {
        const n = 100

        for (let i = 0; i < 1000; i++) {
            const randomNum = random(n)

            expect(randomNum).toBeGreaterThanOrEqual(0)
            expect(randomNum).toBeLessThanOrEqual(n)
        }
    })
    it('should return a random element from an array', () => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        const array2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

        for (let i = 0; i < 1000; i++) {
            const randomElement = random(array)
            const randomElement2 = random(array2)

            expect(array).toContain(randomElement)
            expect(array2).toContain(randomElement2)
        }
    })

    it('should throw an error if n is negative', () => {
        expect(() => random(-1)).toThrow()
    })
    it('should throw an error if min is greater than max', () => {
        expect(() => random(2, 1)).toThrow()
        expect(() => random(35, 10)).toThrow()
        expect(() => random(100, 1)).toThrow()
        expect(() => random(255, 0)).toThrow()
    })
    it('should throw an error if min and max are negative', () => {
        expect(() => random(-2, -1)).toThrow()
        expect(() => random(-35, -10)).toThrow()
        expect(() => random(-100, -1)).toThrow()
        expect(() => random(-128, -2)).toThrow()
    })
})
