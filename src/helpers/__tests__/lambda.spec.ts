import { lambda } from '../Experimental/lambda'

describe('lambda', () => {
    const fn = (foo: string, bar: number): [bar: number, foo: string] => [bar, foo]

    it('should be able to create a lambda', () => {
        const λ = lambda(fn)

        expect(λ).toBeInstanceOf(Function)
        expect(λ).toBe(fn)

        expect(λ).toHaveProperty('invoke')
        expect(λ.invoke).toBeInstanceOf(Function)
        expect(λ.invoke).toBe(λ)
        expect(λ.invoke).toBe(fn)
    })

    it('should return the same as original function', () => {
        const λ = lambda(fn)

        expect(λ('foo', 1)).toEqual([1, 'foo'])
        expect(λ('foo', 1)).toEqual(fn('foo', 1))
        expect(λ.invoke('foo', 1)).toEqual([1, 'foo'])
        expect(λ.invoke('foo', 1)).toEqual(fn('foo', 1))
    })

    it('should be able to curry 2+ param functions', () => {
        const λ = lambda(fn)

        expect(() => λ.curry()).not.toThrow()
        expect(() => λ.curry(true)).not.toThrow()
        expect(λ.curry()).toBeInstanceOf(Function)
        expect(λ.curry()).toHaveProperty('invoke')
        expect(λ.curry().invoke).toBeInstanceOf(Function)
        expect(λ.curry(true)).toBeInstanceOf(Function)
        expect(λ.curry(true)).toHaveProperty('invoke')
        expect(λ.curry(true).invoke).toBeInstanceOf(Function)
        expect(λ.curry()()()).toBeInstanceOf(Function)
        expect(λ.curry()()()).toHaveProperty('invoke')
        expect(λ.curry()('foo')(0)).toEqual([0, 'foo'])
        expect(λ.curry()()()('foo')()()()()(0)).toEqual([0, 'foo'])
        // TODO: fix this (invoke should be a function)
        // expect(λ.curry()()().invoke).toBeInstanceOf(Function)
    })
})
