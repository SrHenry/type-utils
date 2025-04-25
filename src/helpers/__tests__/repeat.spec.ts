import { repeat } from '../../helpers'
import { curry } from '../Experimental/curry'

describe('repeat', () => {
    it('should run a callback function n times', () => {
        const callback = jest.fn()
        repeat(callback, 5)

        expect(callback).toHaveBeenCalledTimes(5)
    })

    it('snould throw an error if the number of loops is less than 1', () => {
        expect(() => repeat(jest.fn(), 0)).toThrow()
        expect(() => repeat(jest.fn(), -10)).toThrow()
    })
    it('implementation should have 2 parameters', () => {
        expect(repeat.length).toBe(2)
    })
    it('should be curriable', () => {
        const callback = jest.fn()
        const mock2 = jest.fn()
        const repeatCurried = curry(repeat)

        expect(repeatCurried).toBeInstanceOf(Function)

        const repeatFn = repeatCurried(callback)

        expect(callback).toHaveBeenCalledTimes(0)
        expect(mock2).toHaveBeenCalledTimes(0)
        expect(repeatFn).toBeInstanceOf(Function)

        const repeat5 = repeatFn(7)
        repeat(mock2, 7)

        expect(repeat5).toBeUndefined()
        expect(callback).toHaveBeenCalledTimes(7)
        expect(mock2).toHaveBeenCalledTimes(7)

        repeatFn(170)
        repeat(mock2, 170)

        expect(callback).toHaveBeenCalledTimes(177)
        expect(mock2).toHaveBeenCalledTimes(177)
    })
    it('should be curriable with partial application', () => {
        const callback = jest.fn()
        const repeatCurried = curry(repeat, true)
        const repeatFn = repeatCurried(callback)

        expect(repeatFn).toBeInstanceOf(Function)

        const repeat5 = repeatFn(5)

        expect(repeat5).toBeUndefined()
        expect(callback).toHaveBeenCalledTimes(5)

        repeatFn(6)

        expect(callback).toHaveBeenCalledTimes(11)

        const mock2 = jest.fn()
        repeatCurried(mock2, 10)

        expect(mock2).toHaveBeenCalledTimes(10)
    })
})
