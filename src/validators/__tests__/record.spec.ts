import { RecordRules } from '../rules/Record'
import { boolean, number } from '../schema'
import { any } from '../schema/any'
import { record } from '../schema/record'
import { string } from '../schema/string'

describe('record', () => {
    it('should validate an empty record', () => {
        const schema = record()
        expect(schema({})).toBe(true)
        expect(schema({ foo: 'bar' })).toBe(true)
        expect(schema({ foo: 123 })).toBe(true)

        const schema2 = record({ nonEmpty: true })

        expect(schema2({})).toBe(false)
        expect(schema2({ foo: 'bar' })).toBe(true)
        expect(schema2({ foo: 123 })).toBe(true)

        const schema3 = record([RecordRules.nonEmpty()])

        expect(schema3({})).toBe(false)
        expect(schema3({ foo: 'bar' })).toBe(true)
        expect(schema3({ foo: 123 })).toBe(true)
    })

    it('should validate a record with string keys and any values', () => {
        const schema = record(string(), any())

        expect(schema({})).toBe(true)
        expect(schema({ foo: 'bar' })).toBe(true)
        expect(schema({ foo: 123 })).toBe(true)
        expect(schema({ foo: true })).toBe(true)
        expect(schema({ foo: null })).toBe(true)
        expect(schema({ foo: undefined })).toBe(true)

        const schema2 = record()

        expect(schema2({})).toBe(true)
        expect(schema2({ foo: 'bar' })).toBe(true)
        expect(schema2({ foo: 123 })).toBe(true)
        expect(schema2({ foo: true })).toBe(true)
        expect(schema2({ foo: null })).toBe(true)
        expect(schema2({ foo: undefined })).toBe(true)
    })

    it('should validate a record with string keys and string values', () => {
        const schema = record(string(), string())

        expect(schema({})).toBe(true)
        expect(schema({ foo: 'bar' })).toBe(true)
        expect(schema({ foo: 123 })).toBe(false)
        expect(schema({ foo: true })).toBe(false)
        expect(schema({ foo: null })).toBe(false)
        expect(schema({ foo: undefined })).toBe(false)

        expect(schema({ foo: 'bar', bar: 'baz' })).toBe(true)
        expect(schema({ foo: 'bar', bar: 123 })).toBe(false)
        expect(schema({ foo: 'bar', bar: true })).toBe(false)
        expect(schema({ foo: 'bar', bar: null })).toBe(false)
        expect(schema({ foo: 'bar', bar: undefined })).toBe(false)
    })

    it('should validate a record with string keys and number values', () => {
        const schema = record(string(), number())

        expect(schema({})).toBe(true)
        expect(schema({ foo: 'bar' })).toBe(false)
        expect(schema({ foo: 123 })).toBe(true)
        expect(schema({ foo: true })).toBe(false)
        expect(schema({ foo: null })).toBe(false)
        expect(schema({ foo: undefined })).toBe(false)

        expect(schema({ foo: 123, bar: 456 })).toBe(true)
        expect(schema({ foo: 123, bar: 'baz' })).toBe(false)
        expect(schema({ foo: 123, bar: true })).toBe(false)
        expect(schema({ foo: 123, bar: null })).toBe(false)
        expect(schema({ foo: 123, bar: undefined })).toBe(false)
    })

    it('should validate a record with string keys and boolean values', () => {
        const schema = record(string(), boolean())

        expect(schema({})).toBe(true)
        expect(schema({ foo: 'bar' })).toBe(false)
        expect(schema({ foo: 123 })).toBe(false)
        expect(schema({ foo: true })).toBe(true)
        expect(schema({ foo: null })).toBe(false)
        expect(schema({ foo: undefined })).toBe(false)

        expect(schema({ foo: true, bar: false })).toBe(true)
        expect(schema({ foo: true, bar: 'baz' })).toBe(false)
        expect(schema({ foo: true, bar: 123 })).toBe(false)
        expect(schema({ foo: true, bar: null })).toBe(false)
        expect(schema({ foo: true, bar: undefined })).toBe(false)
    })

    it('should have an optional method embeded in the schema', () => {
        expect(record).toHaveProperty('optional')
        expect(typeof record.optional).toBe('function')

        const schema = record.optional()

        expect(typeof schema).toBe('function')
    })

    it('should validate undefined when optional schema', () => {
        const schema = record.optional()

        expect(schema(undefined)).toBe(true)
    })

    it('should validate an empty record when optional schema', () => {
        const schema = record.optional()

        expect(schema({})).toBe(true)
        expect(schema({ foo: 'bar' })).toBe(true)
        expect(schema({ foo: 123 })).toBe(true)

        const schema2 = record.optional({ nonEmpty: true })

        expect(schema2({})).toBe(false)
        expect(schema2({ foo: 'bar' })).toBe(true)
        expect(schema2({ foo: 123 })).toBe(true)

        const schema3 = record.optional([RecordRules.nonEmpty()])

        expect(schema3({})).toBe(false)
        expect(schema3({ foo: 'bar' })).toBe(true)
        expect(schema3({ foo: 123 })).toBe(true)
    })

    it('should validate a record with string keys and any values when optional schema', () => {
        const schema = record.optional(string(), any())

        expect(schema({})).toBe(true)
        expect(schema({ foo: 'bar' })).toBe(true)
        expect(schema({ foo: 123 })).toBe(true)
        expect(schema({ foo: true })).toBe(true)
        expect(schema({ foo: null })).toBe(true)
        expect(schema({ foo: undefined })).toBe(true)

        const schema2 = record.optional()

        expect(schema2({})).toBe(true)
        expect(schema2({ foo: 'bar' })).toBe(true)
        expect(schema2({ foo: 123 })).toBe(true)
        expect(schema2({ foo: true })).toBe(true)
        expect(schema2({ foo: null })).toBe(true)
        expect(schema2({ foo: undefined })).toBe(true)
    })

    it('should validate a record with string keys and string values when optional schema', () => {
        const schema = record.optional(string(), string())

        expect(schema({})).toBe(true)
        expect(schema({ foo: 'bar' })).toBe(true)
        expect(schema({ foo: 123 })).toBe(false)
        expect(schema({ foo: true })).toBe(false)
        expect(schema({ foo: null })).toBe(false)
        expect(schema({ foo: undefined })).toBe(false)

        expect(schema({ foo: 'bar', bar: 'baz' })).toBe(true)
        expect(schema({ foo: 'bar', bar: 123 })).toBe(false)
        expect(schema({ foo: 'bar', bar: true })).toBe(false)
        expect(schema({ foo: 'bar', bar: null })).toBe(false)
        expect(schema({ foo: 'bar', bar: undefined })).toBe(false)
    })

    it('should validate a record with string keys and number values when optional schema', () => {
        const schema = record.optional(string(), number())

        expect(schema({})).toBe(true)
        expect(schema({ foo: 'bar' })).toBe(false)
        expect(schema({ foo: 123 })).toBe(true)
        expect(schema({ foo: true })).toBe(false)
        expect(schema({ foo: null })).toBe(false)
        expect(schema({ foo: undefined })).toBe(false)

        expect(schema({ foo: 123, bar: 456 })).toBe(true)
        expect(schema({ foo: 123, bar: 'baz' })).toBe(false)
        expect(schema({ foo: 123, bar: true })).toBe(false)
        expect(schema({ foo: 123, bar: null })).toBe(false)
        expect(schema({ foo: 123, bar: undefined })).toBe(false)
    })

    it('should validate a record with string keys and boolean values when optional schema', () => {
        const schema = record.optional(string(), boolean())

        expect(schema({})).toBe(true)
        expect(schema({ foo: 'bar' })).toBe(false)
        expect(schema({ foo: 123 })).toBe(false)
        expect(schema({ foo: true })).toBe(true)
        expect(schema({ foo: null })).toBe(false)
        expect(schema({ foo: undefined })).toBe(false)

        expect(schema({ foo: true, bar: false })).toBe(true)
        expect(schema({ foo: true, bar: 'baz' })).toBe(false)
        expect(schema({ foo: true, bar: 123 })).toBe(false)
        expect(schema({ foo: true, bar: null })).toBe(false)
        expect(schema({ foo: true, bar: undefined })).toBe(false)
    })
})
