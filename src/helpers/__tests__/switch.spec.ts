import { $switch } from '../Experimental/switch'

describe('$switch', () => {
    it('should return the first matching value', () => {
        const result = $switch(1)
            .case(4, 'four')
            .case(3, 'three')
            .case(2, 'two')
            .case(1, 'one')
            .default('default')
            .invoke()

        expect(result).toBe('one')
    })

    it('should return the default value', () => {
        const result = $switch(5)
            .case(4, 'four')
            .case(3, 'three')
            .case(2, 'two')
            .case(1, 'one')
            .default('default')
            .invoke()

        expect(result).toBe('default')
    })

    it('should throw if has no matches when no default is defined', () => {
        const switcher = $switch(5).case(4, 'four').case(3, 'three').case(2, 'two').case(1, 'one')

        expect(() => switcher.invoke()).toThrow()
    })

    it('should require switch argument to be passed if not provided to factory function', () => {
        const switcher = $switch()
            .case(4, 'four')
            .case(3, 'three')
            .case(2, 'two')
            .case(1, 'one')
            .default('none of the above')

        // @ts-ignore
        expect(() => switcher.invoke()).toThrow()
        expect(() => switcher.invoke(1)).not.toThrow()
        expect(switcher.invoke(1)).toBe('one')
        expect(switcher.invoke(2)).toBe('two')
        expect(switcher.invoke(3)).toBe('three')
        expect(switcher.invoke(4)).toBe('four')
        expect(switcher.invoke(5)).toBe('none of the above')
    })

    it('should validate predicates passed as matchers', () => {
        const switcher = $switch(5)
            .case(n => n % 2 === 0, 'pair')
            .case(n => n % 3 === 0, 'multiple of three')
            .case(n => n % 5 === 0, 'multiple of five')

            .default('odd')

        expect(switcher.invoke()).toBe('multiple of five')
    })

    it('should validate predicates passed as matchers alongside with constant value matchers', () => {
        const switcher = $switch<number>()
            .case(n => n % 2 === 0, 'pair')
            .case(5, 'five')
            .case(n => n % 3 === 0, 'multiple of three')
            .case(1, 'one')

        expect(switcher.invoke(5)).toBe('five')
        expect(switcher.invoke(1)).toBe('one')
        expect(switcher.invoke(3)).toBe('multiple of three')
        expect(switcher.invoke(4)).toBe('pair')
    })

    it('should run callbacks to resolve values on match', () => {
        const switcher = $switch<number>()
            .case(
                n => n % 2 === 0,
                () => Math.floor(Math.random() * 10_000) + 1
            )
            .default(n => n ** n)

        expect(switcher.invoke(2)).toBeGreaterThan(0)
        expect(switcher.invoke(3)).toBe(27)
        expect(switcher.invoke(4)).toBeGreaterThan(0)
        expect(switcher.invoke(5)).toBe(3125)
        expect(switcher.invoke(6)).toBeGreaterThan(0)
        expect(switcher.invoke(7)).toBe(823_543)
    })

    it('should run callbacks to resolve values on match alongside with constant values instead of a resolver', () => {
        const switcher = $switch<number>()
            .case(
                n => n % 2 === 0,
                () => Math.floor(Math.random() * 10_000) + 1
            )
            .case(5, 5)
            .case(3, 3)
            .case(1, 1)
            .default(n => n ** n)

        expect(switcher.invoke(2)).toBeGreaterThan(0)
        expect(switcher.invoke(3)).toBe(3)
        expect(switcher.invoke(4)).toBeGreaterThan(0)
        expect(switcher.invoke(5)).toBe(5)
        expect(switcher.invoke(6)).toBeGreaterThan(0)
        expect(switcher.invoke(7)).toBe(823_543)
        expect(String(switcher.invoke(20))).toMatch(/\d+(\.\d+)?/)
    })

    it('should not be able to override default value of switch argument once provided to factory function', () => {
        const switcher = $switch(25)
            .case(4, 'four')
            .case(3, 'three')
            .case(2, 'two')
            .case(1, 'one')
            .default('default')

        expect(switcher.invoke()).toBe('default')

        // @ts-ignore
        expect(switcher.invoke(4)).not.toBe('four')
        // @ts-ignore
        expect(switcher.invoke(4)).toBe('default')

        // @ts-ignore
        expect(switcher.invoke(3)).not.toBe('three')
        // @ts-ignore
        expect(switcher.invoke(3)).toBe('default')

        // @ts-ignore
        expect(switcher.invoke(2)).not.toBe('two')
        // @ts-ignore
        expect(switcher.invoke(2)).toBe('default')

        // @ts-ignore
        expect(switcher.invoke(1)).not.toBe('one')
        // @ts-ignore
        expect(switcher.invoke(1)).toBe('default')
    })
})
