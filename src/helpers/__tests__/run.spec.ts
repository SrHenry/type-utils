import { isErr, ok } from '../../validators/helpers/result.ts'
import { run } from '../Experimental/run.ts'
import type { Result } from '../../types/Result.ts'

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
    it('wraps non-Error values thrown synchronously into an Error so isErr() does not throw', () => {
        const throwString = (_x: number): any => {
            throw 'string failure'
        }
        const throwObject = (_x: number): any => {
            throw { code: 42 }
        }
        const throwNumber = (_x: number): any => {
            throw 404
        }

        for (const cb of [throwString, throwObject, throwNumber]) {
            const result = run(cb, 0) as Result<unknown, Error>
            const [err, val] = result

            expect(val).toBe(null)
            expect(err).toBeInstanceOf(Error)
            expect(() => isErr(result)).not.toThrow()
            expect(isErr(result)).toBe(true)
        }
    })
    it('wraps non-Error promise rejections into an Error so isErr() does not throw', async () => {
        const rejectString = async (_x: number): Promise<any> => {
            throw 'async string failure'
        }
        const rejectObject = async (_x: number): Promise<any> => {
            throw { reason: 'nope' }
        }
        const rejectNumber = async (_x: number): Promise<any> => {
            throw 500
        }

        for (const cb of [rejectString, rejectObject, rejectNumber]) {
            const result = (await run(cb, 1)) as Result<unknown, Error>
            const [err, val] = result

            expect(val).toBe(null)
            expect(err).toBeInstanceOf(Error)
            expect(() => isErr(result)).not.toThrow()
            expect(isErr(result)).toBe(true)
        }
    })
    it('preserves existing Error instances unchanged (no re-wrapping)', () => {
        const custom = new RangeError('out of range')
        const cb = (_x: number): any => {
            throw custom
        }
        const [err] = run(cb, 0) as Result<unknown, Error>

        expect(err).toBe(custom)
    })
    it('preserves async Error rejections unchanged (no re-wrapping)', async () => {
        const custom = new TypeError('bad type')
        const cb = async (_x: number): Promise<any> => {
            throw custom
        }
        const [err] = (await run(cb, 1)) as Result<unknown, Error>

        expect(err).toBe(custom)
    })
    it('round-trips ok() results for non-throwing sync callbacks', () => {
        const [err, val] = run((a: number) => a * 2, 21) as Result<unknown, Error>

        expect(err).toBe(null)
        expect(val).toBe(42)
        expect(ok(val)).toEqual([null, 42])
    })
})
