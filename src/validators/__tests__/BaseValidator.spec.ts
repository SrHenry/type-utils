import { BaseValidator } from '../BaseValidator'

describe('BaseValidator', () => {
    it('should return true if the value is valid', () => {
        const foo = {
            a: 1,
            b: false,
            c: 'foo',
        }

        const bar = {
            a: 0xff,
            b: true,
            c: 'bar',
        }

        const baz = {
            a: '0b11111111',
            b: false,
            c: 'baz',
        }

        const validators1 = {
            a: (arg: unknown): arg is number => typeof arg === 'number',
            b: (arg: unknown): arg is boolean => typeof arg === 'boolean',
            c: (arg: unknown): arg is string => typeof arg === 'string',
        }
        const validators2 = {
            a: (arg: unknown): arg is string => typeof arg === 'string',
            b: (arg: unknown): arg is boolean => typeof arg === 'boolean',
            c: (arg: unknown): arg is string => typeof arg === 'string',
        }

        expect(() =>
            BaseValidator.validateProperties(foo, { validators: validators1 })
        ).not.toThrow()
        expect(() =>
            BaseValidator.validateProperties(bar, { validators: validators1 })
        ).not.toThrow()
        expect(() =>
            BaseValidator.validateProperties(baz, { validators: validators2 })
        ).not.toThrow()

        expect(() => BaseValidator.validateProperties(foo, { validators: validators2 })).toThrow()
        expect(() => BaseValidator.validateProperties(baz, { validators: validators1 })).toThrow()

        expect(BaseValidator.hasValidProperties(foo, { validators: validators1 })).toBe(true)
        expect(BaseValidator.hasValidProperties(foo, { validators: validators2 })).toBe(false)

        expect(BaseValidator.hasValidProperties(bar, { validators: validators1 })).toBe(true)
        expect(BaseValidator.hasValidProperties(bar, { validators: validators2 })).toBe(false)

        expect(BaseValidator.hasValidProperties(baz, { validators: validators1 })).toBe(false)
        expect(BaseValidator.hasValidProperties(baz, { validators: validators2 })).toBe(true)

        expect(() =>
            BaseValidator.validateArray([foo, bar], { validators: validators1 })
        ).not.toThrow()
        expect(() => BaseValidator.validateArray([baz], { validators: validators2 })).not.toThrow()
        expect(() =>
            BaseValidator.validateArray([foo, bar, baz], { validators: validators1 })
        ).toThrow()
    })
})
