import { and } from '../schema/and'
import { any } from '../schema/any'
import { array } from '../schema/array'
import { boolean } from '../schema/boolean'
import { number } from '../schema/number'
import { object } from '../schema/object'
import { or } from '../schema/or'
import { string } from '../schema/string'
import { symbol } from '../schema/symbol'
import { useSchema } from '../schema/useSchema'
import { ValidationErrors } from '../ValidationErrors'

describe('[...schemas].validator', () => {
    it('should be a function and return a validator function', () => {
        expect(typeof any().validator).toBe('function')
        expect(typeof any().validator()).toBe('function')
        expect(typeof any().validator().validate).toBe('function')
        expect(any().validator()(-1)).toBe(-1)
        expect(any().validator().validate(-1)).toBe(-1)

        expect(typeof and(any(), any()).validator).toBe('function')
        expect(typeof and(any(), any()).validator()).toBe('function')
        expect(typeof and(any(), any()).validator().validate).toBe('function')
        expect(and(any(), any()).validator()(true)).toBe(true)
        expect(and(any(), any()).validator().validate(true)).toBe(true)

        expect(typeof array().validator).toBe('function')
        expect(typeof array().validator()).toBe('function')
        expect(typeof array().validator().validate).toBe('function')
        expect(array().validator()([])).toMatchObject([])
        expect(array().validator().validate([])).toMatchObject([])

        expect(typeof boolean().validator).toBe('function')
        expect(typeof boolean().validator()).toBe('function')
        expect(typeof boolean().validator().validate).toBe('function')
        expect(boolean().validator()(false)).toBe(false)
        expect(boolean().validator().validate(false)).toBe(false)

        expect(typeof number().validator).toBe('function')
        expect(typeof number().validator()).toBe('function')
        expect(typeof number().validator().validate).toBe('function')
        expect(number().validator()(0)).toBe(0)
        expect(number().validator().validate(0)).toBe(0)

        expect(typeof object().validator).toBe('function')
        expect(typeof object().validator()).toBe('function')
        expect(typeof object().validator().validate).toBe('function')
        expect(object().validator()({})).toMatchObject({})
        expect(object().validator().validate({})).toMatchObject({})

        expect(typeof or(any(), any()).validator).toBe('function')
        expect(typeof or(any(), any()).validator()).toBe('function')
        expect(or(any(), any()).validator()(true)).toBe(true)
        expect(or(any(), any()).validator().validate(true)).toBe(true)

        expect(typeof string().validator).toBe('function')
        expect(typeof string().validator()).toBe('function')
        expect(typeof string().validator().validate).toBe('function')
        expect(string().validator()('')).toBe('')
        expect(string().validator().validate('')).toBe('')

        expect(typeof symbol().validator).toBe('function')
        expect(typeof symbol().validator()).toBe('function')
        expect(typeof symbol().validator().validate).toBe('function')
        expect(symbol().validator()(Symbol.for('test'))).toBe(Symbol.for('test'))
        expect(symbol().validator().validate(Symbol.for('test2'))).toBe(Symbol.for('test2'))

        expect(typeof useSchema(any()).validator).toBe('function')
        expect(typeof useSchema(any()).validator()).toBe('function')
        expect(typeof useSchema(any()).validator().validate).toBe('function')
        expect(useSchema(any()).validator()(true)).toBe(true)
        expect(useSchema(any()).validator().validate(true)).toBe(true)
    })

    it('should validate according to schema', () => {
        const schema = object({
            foo: string(),
            bar: number(),
            baz: boolean().optional(),
        })

        expect(schema.validator(false).validate(void 0)).toBeInstanceOf(ValidationErrors)
        expect(() => schema.validator().validate({ foo: '' })).toThrow(ValidationErrors)
        expect(() => schema.validator(true).validate({ foo: '', bar: 0 })).not.toThrow(
            ValidationErrors
        )
        expect(() => schema.validator(true).validate({ foo: '', bar: 0, baz: true })).not.toThrow(
            ValidationErrors
        )
        expect(() => schema.validator(true).validate({ foo: '', bar: 0, baz: -1 })).toThrow(
            ValidationErrors
        )

        const schema2 = or(
            object({
                foo: string(),
                bar: number(),
                baz: boolean().optional(),
            }),
            string().nonEmpty().min(2)
        )

        expect(schema2.validator(false).validate(void 0)).toBeInstanceOf(ValidationErrors)
        expect(() => schema2.validator().validate({ foo: '' })).toThrow(ValidationErrors)
        expect(() => schema2.validator(true).validate({ foo: '', bar: 0 })).not.toThrow(
            ValidationErrors
        )
        expect(() => schema2.validator(true).validate({ foo: '', bar: 0, baz: true })).not.toThrow(
            ValidationErrors
        )
        expect(() => schema2.validator(true).validate({ foo: '', bar: 0, baz: -1 })).toThrow(
            ValidationErrors
        )
        expect(() => schema2.validator(true).validate('')).toThrow(ValidationErrors)
        expect(() => schema2.validator(true).validate('a')).toThrow(ValidationErrors)
        expect(() => schema2.validator(true).validate('ab')).not.toThrow(ValidationErrors)
        expect(() => schema2.validator(true).validate('abc')).not.toThrow(ValidationErrors)
    })
})
