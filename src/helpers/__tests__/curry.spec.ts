import { curry } from '../Experimental'

describe('curry', () => {
    it('should have no effect in functions with up to one parameter', () => {
        const fn = (a: number) => a
        const fn2 = () => 'foo'

        const curriedFn = curry(fn)
        const curriedFn2 = curry(fn2)

        expect(curriedFn).toBeInstanceOf(Function)
        expect(curriedFn2).toBeInstanceOf(Function)
        expect(curriedFn).toBe(fn)
        expect(curriedFn2).toBe(fn2)
        expect(curriedFn(1)).toBe(1)
        expect(curriedFn2()).toBe('foo')
    })

    it('should be able to curry 2+ param functions', () => {
        const fn = (a: number, b: string, c: boolean) => `${a} ${b} ${c}`
        const curriedFn = curry(fn)
        const curriedPartialApplyFn = curry(fn, true)

        expect(() => curriedFn()).not.toThrow()
        expect(() => curriedFn()()()).not.toThrow()
        expect(curriedFn()()()).toBeInstanceOf(Function)
        expect(curriedFn).toBeInstanceOf(Function)
        expect(curriedFn).not.toHaveProperty('invoke')
        expect(() => curriedPartialApplyFn()).not.toThrow()
        expect(() => curriedPartialApplyFn()()()).not.toThrow()
        expect(curriedPartialApplyFn()()()).toBeInstanceOf(Function)
        expect(curriedPartialApplyFn).toBeInstanceOf(Function)
        expect(curriedPartialApplyFn).not.toHaveProperty('invoke')
        expect(curriedPartialApplyFn(1, 'foo', true)).toBe(`${1} foo ${true}`)
        expect(curriedPartialApplyFn(1, 'foo')(true)).toBe(`${1} foo ${true}`)
        expect(curriedPartialApplyFn(1)('foo', true)).toBe(`${1} foo ${true}`)
        expect(curriedPartialApplyFn(1)('foo')(true)).toBe(`${1} foo ${true}`)
        expect(curriedPartialApplyFn(1)('foo')()(true)).toBe(`${1} foo ${true}`)
        expect(curriedPartialApplyFn(1)()('foo')()()(true)).toBe(`${1} foo ${true}`)
    })
})
