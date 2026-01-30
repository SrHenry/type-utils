import type { TypeGuard } from '../../TypeGuards/types'
import type { V3 } from '../schema'
import { boolean } from '../schema/boolean'
import { getStructMetadata } from '../schema/helpers/getStructMetadata'
import { number } from '../schema/number'
import { string } from '../schema/string'
import { tuple } from '../schema/tuple'

describe('tuple', () => {
    it('should validate a basic tuple', () => {
        const schema = tuple([string(), number()])

        expect(schema(['hello', 42])).toBe(true)
        expect(schema([42, 'hello'])).toBe(false)
        expect(schema(['hello'])).toBe(false)
        expect(schema(['hello', 42, true])).toBe(false)
        expect(schema(['hello', 42, undefined])).toBe(false)
        expect(schema(['hello', 42, undefined, undefined])).toBe(false)
    })

    it('should validate empty tuple', () => {
        const schema = tuple([])

        expect(schema([])).toBe(true)
        expect(schema(['hello'])).toBe(false)
        expect(schema([undefined])).toBe(false)
        expect(schema([undefined, undefined])).toBe(false)
    })

    it('should validate complex tuples', () => {
        const schema = tuple([string(), number(), boolean()])

        expect(schema(['test', 123, true])).toBe(true)
        expect(schema(['test', 123, 'true'])).toBe(false)
        expect(schema(['test', '123', true])).toBe(false)
        expect(schema(['test', '123', true, undefined])).toBe(false)
        expect(schema(['test', '123', true, undefined, undefined])).toBe(false)
    })

    it('should handle null and undefined', () => {
        const schema = tuple([string(), number()])

        expect(schema(null)).toBe(false)
        expect(schema(undefined)).toBe(false)
        expect(schema(['test', null])).toBe(false)
        expect(schema(['test', undefined])).toBe(false)
        expect(schema(['test', 123])).toBe(true)
        expect(schema(['test', 123, undefined])).toBe(false)
        expect(schema(['test', 123, null])).toBe(false)
        expect(schema(['test', 123, undefined, undefined])).toBe(false)
        expect(schema(['test', 123, undefined, null])).toBe(false)
        expect(schema(['test', 123, null, null])).toBe(false)
    })

    it('should validate nested tuples', () => {
        const nestedSchema = tuple([tuple([string(), number()]), boolean()])

        expect(nestedSchema([['hello', 42], true])).toBe(true)
        expect(nestedSchema([['hello', 'wrong'], true])).toBe(false)
        expect(nestedSchema([['hello'], true])).toBe(false)
    })

    it('should be the same schema when using the alternative signature', () => {
        type Tuple = readonly [string, number]

        const schema1: TypeGuard<Tuple> = tuple([string(), number()])
        const schema2: TypeGuard<Tuple> = tuple(string(), number())

        const struct1 = getStructMetadata(schema1) as unknown as V3.TupleStruct<Tuple>
        const struct2 = getStructMetadata(schema2) as unknown as V3.TupleStruct<Tuple>

        expect(struct1).toMatchStructure(struct2)
    })
})
