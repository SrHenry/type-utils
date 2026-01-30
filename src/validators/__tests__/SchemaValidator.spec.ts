import type { TypeGuard } from '../../TypeGuards/types'

import { asTypeGuard } from '../../TypeGuards/helpers/asTypeGuard'
import { isInstanceOf } from '../../TypeGuards/helpers/isInstanceOf'
import { createRule } from '../rules/helpers/createRule'
import { and } from '../schema/and'
import { array } from '../schema/array'
import { boolean } from '../schema/boolean'
import { number } from '../schema/number'
import { object } from '../schema/object'
import { or } from '../schema/or'
import { string } from '../schema/string'
import { symbol } from '../schema/symbol'
import { useSchema } from '../schema/useSchema'
// import { and, array, boolean, number, object, or, string, symbol, useSchema } from '../schema'

import { SchemaValidator } from '../SchemaValidator'
import { ValidationErrors } from '../ValidationErrors'
import { createInlineRule } from '../rules/helpers/createInlineRule'
import { createRuleHandler } from '../rules/helpers/createRuleHandler'

describe('SchemaValidator', () => {
    it('should validate a primitive value', () => {
        expect(SchemaValidator.validate(20, number())).toBe(20)
        expect(() => SchemaValidator.validate(0, number().nonZero())).toThrow(ValidationErrors)

        expect(SchemaValidator.validate('foo', string())).toBe('foo')
        expect(() => SchemaValidator.validate('', string().nonEmpty())).toThrow(ValidationErrors)

        expect(SchemaValidator.validate(true, boolean())).toBe(true)
        expect(() => SchemaValidator.validate(undefined, boolean())).toThrow(ValidationErrors)

        expect(SchemaValidator.validate(Symbol(), symbol()))
        expect(() => SchemaValidator.validate('[Symbol symbol]', symbol())).toThrow(
            ValidationErrors
        )
    })
    it('should validate using a branchable schema', () => {
        const value1 = 'foo'
        const value2 = 'bar'
        const value3 = 'baz'

        const schema = or(string('foo'), string('bar'))

        expect(SchemaValidator.validate(value1, schema)).toBe(value1)
        expect(SchemaValidator.validate(value2, schema)).toBe(value2)
        expect(() => SchemaValidator.validate(value3, schema)).toThrow(ValidationErrors)

        const hasUpperCaseRuleHandler = createRuleHandler((subject: string) => {
            return /[A-Z]/g.test(subject)
        })

        const HasUpperCaseRule = createRule({
            name: '[test]::Custom.String.HasUpperCase',
            message: 'String must have at least one uppercase letter',
            messageFormator: (arg: string) =>
                `${arg ?? 'string'} must have at least one uppercase letter`,
            handler: hasUpperCaseRuleHandler,
        })

        const StringLongerThanFiveCharsHasUpperCaseSchema = () =>
            useSchema(asTypeGuard((s: string) => s.length > 5, { rules: [] })).use(
                HasUpperCaseRule()
            )

        const schema2 = or(schema, and(string(), StringLongerThanFiveCharsHasUpperCaseSchema()))

        // expect(getMessage(getStructMetadata(schema2).schema)).toBe('')

        expect(SchemaValidator.validate("I'm a string", schema2)).toBe("I'm a string")
        expect(() => SchemaValidator.validate(value3, schema2)).toThrow(ValidationErrors)
        expect(SchemaValidator.validate(value1, schema2, false)).toBe(value1)
        expect(SchemaValidator.validate(value2, schema2)).toBe(value2)

        expect(() => SchemaValidator.validate(value3, schema2)).toThrow(ValidationErrors)
        expect(SchemaValidator.validate(value3, schema2, false)).toHaveProperty('errors')
        expect(
            (SchemaValidator.validate(value3, schema2, false) as ValidationErrors).errors.some(
                e => e.message === 'Value does not match any of the union types' //&& e.path === '$'
            )
        ).toBe(true)

        expect(() => SchemaValidator.validate('foobar', schema2)).toThrow(ValidationErrors)

        const schema3 = or(number().nonZero(), string().nonEmpty().max(5))

        expect(SchemaValidator.validate(1, schema3)).toBe(1)
        expect(SchemaValidator.validate('foo', schema3)).toBe('foo')
        expect(() => SchemaValidator.validate(0, schema3)).toThrow(ValidationErrors)
        expect(() => SchemaValidator.validate('', schema3)).toThrow(ValidationErrors)
        expect(() => SchemaValidator.validate('foobar', schema3)).toThrow(ValidationErrors)
    })

    const value1 = {
        a: 1,
        b: 'foo',
        c: true,
    }

    const value2 = {
        a: 0xff,
        b: 'bar',
        c: false,
    }

    const value3 = {
        a: '0b11111111',
        b: 'baz',
        c: false,
    }
    const value4 = { a: '', b: 0, c: -1 }

    const schema1 = object({
        a: number(),
        b: string(),
        c: boolean(),
    })
    const schema2 = array(schema1)

    it('should validate using a recursible schema', () => {
        expect(SchemaValidator.validate(value1, schema1)).toBe(value1)
        expect(SchemaValidator.validate(value2, schema1)).toBe(value2)
        expect(() => SchemaValidator.validate(value3, schema1)).toThrow(ValidationErrors)

        expect(SchemaValidator.validate([value1, value2], schema2)).toEqual([value1, value2])
        expect(() => SchemaValidator.validate([value3], schema2)).toThrow(ValidationErrors)
        expect(() => SchemaValidator.validate([value3], schema2, false)).not.toThrow(
            ValidationErrors
        )
        expect(() => SchemaValidator.validate(value3, schema1, false)).not.toThrow(ValidationErrors)
        expect(() =>
            SchemaValidator.validate(
                SchemaValidator.validate(value3, schema1, false),
                and(
                    isInstanceOf(ValidationErrors),
                    asTypeGuard(
                        ({ errors }: ValidationErrors) =>
                            errors.length === 1 && errors[0]!.path === '$.a'
                    )
                )
            )
        ).not.toThrow(ValidationErrors)
        expect(() =>
            SchemaValidator.validate(
                SchemaValidator.validate(value3, schema1, false),
                useSchema(isInstanceOf(ValidationErrors)).use(
                    createInlineRule<ValidationErrors>(
                        ({ errors }) => errors.length === 1 && errors[0]!.path === '$.a'
                    )
                )
            )
        ).not.toThrow(ValidationErrors)
    })
    it('should validate using a schema with a custom message', () => {
        SchemaValidator.setValidatorMessage(
            {
                a: 'must be a number',
                b: 'must be a string',
                c: 'must be a boolean',
            },
            schema1
        )

        const validatedValue3 = and(
            isInstanceOf(ValidationErrors),
            asTypeGuard<ValidationErrors>(
                ({ errors }) =>
                    errors.length === 1 &&
                    errors[0]!.path === '$.a' &&
                    errors[0]!.message === 'must be a number'
            ) // as TypeGuard<ValidationErrors>
        )
        const validatedValues1324 = and(
            isInstanceOf(ValidationErrors),
            (({ errors }: ValidationErrors) =>
                errors.length === 4 &&
                errors[0]!.path === '$[1].a' &&
                errors[0]!.message === 'must be a number' &&
                errors
                    .slice(1)
                    .every(
                        err =>
                            (err.path === '$[3].a' && err.message === 'must be a number') ||
                            (err.path === '$[3].b' && err.message === 'must be a string') ||
                            (err.path === '$[3].c' && err.message === 'must be a boolean')
                    )) as TypeGuard<ValidationErrors>
        )
        expect(() => SchemaValidator.validate(value3, schema1)).toThrow(ValidationErrors)
        expect(() => SchemaValidator.validate([value1, value3, value2], schema2)).toThrow(
            ValidationErrors
        )
        expect(validatedValue3(SchemaValidator.validate(value3, schema1, false))).toBe(true)
        expect(
            validatedValues1324(
                SchemaValidator.validate([value1, value3, value2, value4], schema2, false)
            )
        ).toBe(true)
    })

    it('should validate using a schema with optional branches', () => {
        const schema = object({
            a: number(),
            b: string(),
            c: boolean(),
            d: number().optional(),
            e: string().optional(),
            f: boolean().optional(),
            g: object({
                foo: array(number()),
                bar: string(),
            }).optional(),
        })

        SchemaValidator.setValidatorMessage(
            {
                a: 'must be a number',
                b: 'must be a string',
                c: 'must be a boolean',
                d: 'must be a number',
                e: 'must be a string',
                f: 'must be a boolean',
                g: {
                    foo: 'must be a number',
                    bar: 'must be a string',
                },
            },
            schema
        )

        const value1 = {
            a: 1,
            b: 'foo',
            c: true,
        }

        const value2 = {
            a: 0xff,
            b: 'bar',
            c: false,
            d: 0b11111111,
        }
        const value3 = {
            a: 0xff,
            b: 'bar',
            c: false,
            e: 'baz',
        }
        const value4 = {
            a: 0xff,
            b: 'bar',
            c: false,
            f: true,
        }
        const value5 = {
            a: 0xff,
            b: 'bar',
            c: false,
            d: -1,
            e: 'baz',
        }
        const value6 = {
            a: 0xff,
            b: 'bar',
            c: false,
            d: -1,
            f: true,
        }
        const value7 = {
            a: 0xff,
            b: 'bar',
            c: false,
            e: 'hello',
            f: true,
        }
        const value8 = {
            a: 0xff,
            b: 'bar',
            c: false,
            g: {
                foo: [1, 2, 3],
                bar: 'baz',
            },
        }

        expect(SchemaValidator.validate(value1, schema)).toBe(value1)
        expect(SchemaValidator.validate(value2, schema)).toBe(value2)
        expect(SchemaValidator.validate(value3, schema)).toBe(value3)
        expect(SchemaValidator.validate(value4, schema)).toBe(value4)
        expect(SchemaValidator.validate(value5, schema)).toBe(value5)
        expect(SchemaValidator.validate(value6, schema)).toBe(value6)
        expect(SchemaValidator.validate(value7, schema)).toBe(value7)
        expect(SchemaValidator.validate(value8, schema)).toBe(value8)

        const value9 = {
            a: 0xff,
            b: 'bar',
            c: false,
            d: 'wrong',
        }
        const value10 = {
            a: 0xff,
            b: 'bar',
            c: false,
            e: 0,
        }
        const value11 = {
            a: 0xff,
            b: 'bar',
            c: false,
            g: {},
        }
        const value12 = {
            a: 0xff,
            b: 'bar',
            c: false,
            g: {
                foo: {},
            },
        }
        const value13 = {
            a: 0xff,
            c: false,
            e: true,
            g: {
                bar: -1,
            },
        }

        expect(() => SchemaValidator.validate(value9, schema)).toThrow(ValidationErrors)
        expect(() => SchemaValidator.validate(value10, schema)).toThrow(ValidationErrors)
        expect(() => SchemaValidator.validate(value11, schema)).toThrow(ValidationErrors)
        expect(() => SchemaValidator.validate(value12, schema)).toThrow(ValidationErrors)
        expect(() => SchemaValidator.validate(value13, schema)).toThrow(ValidationErrors)

        const validatedValue9 = and(
            isInstanceOf(ValidationErrors),
            (({ errors }: ValidationErrors) =>
                errors.length === 1 &&
                errors[0]!.path === '$.d' &&
                errors[0]!.message === 'must be a number') as TypeGuard<ValidationErrors>
        )
        const validatedValue10 = and(
            isInstanceOf(ValidationErrors),
            (({ errors }: ValidationErrors) =>
                errors.length === 1 &&
                errors[0]!.path === '$.e' &&
                errors[0]!.message === 'must be a string') as TypeGuard<ValidationErrors>
        )
        const validatedValue11 = and(
            isInstanceOf(ValidationErrors),
            (({ errors }: ValidationErrors) =>
                errors.length === 2 &&
                errors[0]!.path === '$.g' &&
                errors[0]!.message === "Missing key 'foo'" &&
                errors[1]!.path === '$.g' &&
                errors[1]!.message === "Missing key 'bar'") as TypeGuard<ValidationErrors>
        )
        const validatedValue12 = and(
            isInstanceOf(ValidationErrors),
            (({ errors }: ValidationErrors) =>
                errors.length === 2 &&
                errors[0]!.path === '$.g.foo' &&
                /^Expected array, got <.*>.*$/.test(errors[0]!.message) &&
                errors[1]!.path === '$.g' &&
                errors[1]!.message === "Missing key 'bar'") as TypeGuard<ValidationErrors>
        )
        const validatedValue13 = and(
            isInstanceOf(ValidationErrors),
            (({ errors }: ValidationErrors) =>
                errors.length === 4 &&
                errors[0]!.path === '$' &&
                errors[0]!.message === "Missing key 'b'" &&
                errors[1]!.path === '$.e' &&
                errors[1]!.message === 'must be a string' &&
                errors[2]!.path === '$.g' &&
                errors[2]!.message === "Missing key 'foo'" &&
                errors[3]!.path === '$.g.bar' &&
                errors[3]!.message === 'must be a string') as TypeGuard<ValidationErrors>
        )

        expect(validatedValue9(SchemaValidator.validate(value9, schema, false))).toBe(true)
        expect(validatedValue10(SchemaValidator.validate(value10, schema, false))).toBe(true)
        expect(validatedValue11(SchemaValidator.validate(value11, schema, false))).toBe(true)
        expect(validatedValue12(SchemaValidator.validate(value12, schema, false))).toBe(true)
        expect(validatedValue13(SchemaValidator.validate(value13, schema, false))).toBe(true)
    })
})
