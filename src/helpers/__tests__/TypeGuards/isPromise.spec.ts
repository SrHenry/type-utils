import { isPromise } from '../../isPromise'

describe('isPromise', () => {
    it('should return true for a Promise', () => {
        expect(isPromise(new Promise(() => {}))).toBe(true)
    })
    it('should return false for a non-Promise', () => {
        expect(isPromise('no')).toBe(false)
        expect(
            isPromise({
                then: async (fn: <T>(e: any) => T | PromiseLike<T>) => {
                    return await fn(null)
                },
            })
        ).toBe(false)
    })
})
