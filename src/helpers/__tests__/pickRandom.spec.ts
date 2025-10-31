import { pickRandom } from '../pickRandom'

describe('pickRandom', () => {
    it('should pick a random element from an array', () => {
        for (let i = 0; i < 1000; i++) {
            const array = [1, 2, 3, 4, 5]
            const randomElement = pickRandom([...array])

            expect(array).toContain(randomElement)
        }
    })

    it('should remove the picked element from the array', () => {
        for (let i = 0; i < 1000; i++) {
            const array = [1, 2, 3, 4, 5]
            const randomElement = pickRandom(array)

            expect(array).not.toContain(randomElement)
        }
    })

    //below more tests that should throw error when used wrong:

    it('should throw an error if the array is not an array', () => {
        const array = 1
        expect(() => pickRandom(array as any)).toThrow()
    })

    it('should throw an error if the array is empty', () => {
        const array: number[] = []
        expect(() => pickRandom(array)).toThrow()
    })
})
