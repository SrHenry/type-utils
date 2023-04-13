import { isAsyncFunction } from '../../../helpers'
;((async () => {}).constructor.name === 'AsyncFunction' ? describe : describe.skip)(
    'isAsyncFunction',
    () => {
        it('should return true if value is an async function', () => {
            const run = (input: any) => {
                console.log({ input, typeof: typeof input, constructor: input.constructor })
                return isAsyncFunction(input)
            }

            expect(run(async () => {})).toBe(true)
            expect(run(async function () {})).toBe(true)
        })
        it('should return false if value is not an async function', () => {
            expect(isAsyncFunction(() => {})).toBe(false)
            expect(isAsyncFunction(function () {})).toBe(false)
            expect(isAsyncFunction(function* () {})).toBe(false)
            expect(isAsyncFunction(async function* () {})).toBe(false)
            expect(isAsyncFunction(undefined)).toBe(false)
            expect(isAsyncFunction(null)).toBe(false)
            expect(isAsyncFunction('')).toBe(false)
            expect(isAsyncFunction('abc')).toBe(false)
            expect(isAsyncFunction(false)).toBe(false)
            expect(isAsyncFunction(true)).toBe(false)
            expect(isAsyncFunction(0)).toBe(false)
            expect(isAsyncFunction(-1)).toBe(false)
            expect(isAsyncFunction(1)).toBe(false)
            expect(isAsyncFunction(NaN)).toBe(false)
            expect(isAsyncFunction(Infinity)).toBe(false)
            expect(isAsyncFunction(-Infinity)).toBe(false)
            expect(isAsyncFunction({})).toBe(false)
            expect(isAsyncFunction([])).toBe(false)
            expect(isAsyncFunction(new Date())).toBe(false)
            expect(isAsyncFunction(/abc/)).toBe(false)
            expect(isAsyncFunction(new RegExp('abc'))).toBe(false)
            expect(isAsyncFunction(Symbol('abc'))).toBe(false)
            expect(isAsyncFunction(new Error())).toBe(false)
            expect(isAsyncFunction(new TypeError())).toBe(false)
        })
    }
)
