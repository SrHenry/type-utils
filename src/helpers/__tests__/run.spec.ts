import { run } from '../Experimental/run'
describe('run', () => {
    it('should run a callback function and return a tuple with the error or the result of the function', () => {
        const callback = (a: number, b: number) => a + b
        const result = run(callback, 1, 2)

        expect(typeof result).toBe('object')
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(2)

        const [error, value] = result

        expect(error).toBe(null)
        expect(value).toBe(3)

        const callback2 = (_a: number, _b: number): any => {
            throw new Error('Error')
        }
        const result2 = run(callback2, 1, 2)

        expect(typeof result2).toBe('object')
        expect(Array.isArray(result2)).toBe(true)
        expect(result2.length).toBe(2)

        const [error2, value2] = result2

        expect(value2).toBe(null)
        expect(error2).toBeInstanceOf(Error)
    })
    it('should run an async callback function and return a promise with the result of the function', async () => {
        const callback = async (a: number, b: number) => a + b
        const result = run(callback, 1, 2)

        expect(result).toBeInstanceOf(Promise)

        const [error, value] = await result

        expect(error).toBe(null)
        expect(value).toBe(3)

        const callback2 = async (_a: number, _b: number): Promise<any> => {
            throw new Error('Error')
        }
        const result2 = run(callback2, 1, 2)

        expect(result2).toBeInstanceOf(Promise)

        const [error2, value2] = await result2

        expect(error2).toBeInstanceOf(Error)
        expect(value2).toBe(null)
    })
})
