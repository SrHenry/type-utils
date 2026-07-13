import { object } from '../schema/object.ts'
import { string } from '../schema/string.ts'
import { ValidationErrors } from '../ValidationErrors.ts'
import { getStructMetadata } from '../schema/helpers/getStructMetadata.ts'
import type { StandardSchemaV1 as SS } from '../standard-schema/types.ts'

describe('object - strict mode', () => {
    describe('boolean guard', () => {
        it('rejects unknown keys when strict() is chained', () => {
            const schema = object({ id: string() }).strict()

            expect(schema({ id: 'abc' })).toBe(true)
            expect(schema({ id: 'abc', extra: 'oops' })).toBe(false)
        })

        it('accepts objects whose keys exactly match the tree', () => {
            const schema = object({ id: string(), name: string() }).strict()

            expect(schema({ id: 'abc', name: 'Alice' })).toBe(true)
        })

        it('accepts objects missing optional keys when strict() is chained', () => {
            const schema = object({
                id: string(),
                name: string().optional(),
            }).strict()

            expect(schema({ id: 'abc' })).toBe(true)
            expect(schema({ id: 'abc', name: 'Alice' })).toBe(true)
            expect(schema({ id: 'abc', extra: 'oops' })).toBe(false)
        })

        it('rejects unknown keys alongside missing required keys (short-circuits to false)', () => {
            const schema = object({ id: string(), name: string() }).strict()

            expect(schema({ id: 'abc', extra: 'oops' })).toBe(false)
        })

        it('passes through undefined when strict + optional are both chained', () => {
            const schema = object({ id: string() }).strict().optional()

            expect(schema(undefined)).toBe(true)
            expect(schema({ id: 'abc' })).toBe(true)
            expect(schema({ id: 'abc', extra: 'oops' })).toBe(false)
        })

        it('order independence: strict().optional() behaves same as optional().strict()', () => {
            const schemaOrdered = object({ id: string() }).strict().optional()
            const schemaReversed = object({ id: string() }).optional().strict()

            expect(schemaOrdered(undefined)).toBe(schemaReversed(undefined))
            expect(schemaOrdered({ id: 'abc' })).toBe(schemaReversed({ id: 'abc' }))
            expect(schemaOrdered({ id: 'abc', extra: 'x' })).toBe(
                schemaReversed({ id: 'abc', extra: 'x' })
            )
        })

        it('throws when .strict() is called twice', () => {
            const schema = object({ id: string() })

            expect(() => (schema as any).strict().strict()).toThrow(
                /Cannot call strict more than once/
            )
        })

        it('preserves strict behavior under toStandardSchema() interop', () => {
            const schema = object({ id: string() }).strict()
            const standard = schema.toStandardSchema()
            // The StandardSchemaV1 type widens validate()'s return to Result | Promise<Result>
            // (the spec admits async implementations), but our impl is always synchronous.
            // Cast through SS.Result<T> to read `.success` — matches the pattern in
            // standardSchemaCompleteness.spec.ts and compositionWidening.spec.ts.
            const result = standard['~standard'].validate({
                id: 'abc',
                extra: 'x',
            }) as SS.Result<{ id: string }>

            expect(result.success).toBe(false)
        })

        it('returns false for null and undefined inputs (strict handler bypasses, shape check rejects)', () => {
            const schema = object({ id: string() }).strict()

            // Tracing through object.ts for schema(null) / schema(undefined):
            //  - branchIfOptional returns false (no .optional() chained, so no optional rule).
            //  - isFollowingRules runs the strict handler, which short-circuits to true for
            //    `arg === null || typeof arg !== 'object'` (defensive bypass — see strict.ts).
            //  - BaseValidator.hasValidProperties(arg, config) is then evaluated: it calls
            //    ensureInstanceOf(arg, Object), which throws for both null and undefined
            //    (`null instanceof Object` and `undefined instanceof Object` are both false),
            //    so hasValidProperties catches and returns false.
            //  - Guard result: `false || (true && false)` === false.
            // This is a documented quirk: the strict handler intentionally bypasses non-objects
            // so the shape check (not strict) is what rejects them.
            expect(schema(null)).toBe(false)
            expect(schema(undefined)).toBe(false)
        })
    })

    describe('throwing validator', () => {
        it('throws ValidationErrors with a strict error for unknown keys', () => {
            const schema = object({ id: string() }).strict()

            expect(() => schema.validator().validate({ id: 'abc', extra: 'x' })).toThrow(
                ValidationErrors
            )
        })

        it('aggregates strict + per-key errors when both fail', () => {
            const schema = object({ id: string() }).strict()

            let caught: ValidationErrors | null = null
            try {
                schema.validator().validate({ id: 123, extra: 'x' })
            } catch (e) {
                caught = e as ValidationErrors
            }

            expect(caught).toBeInstanceOf(ValidationErrors)
            expect(caught!.errors.length).toBeGreaterThanOrEqual(2)

            const messages = caught!.errors.map(e => e.message)
            // The strict rule formator returns '[rule: strict]' (see rules/Object/formators/strict.ts),
            // so we substring-match 'strict' rather than requiring an exact element.
            expect(messages.some(m => /strict/.test(m))).toBe(true)
            // The per-key error for `id: 123` comes from validateDefault's generic type-mismatch
            // branch (validateDefault.ts), which emits `Value must be of type "string"`.
            // This differs from BaseValidator.validateProperties' `Invalid value for key ${key}`
            // because the throwing validator uses the recursive SchemaValidator path, not the
            // boolean guard path.
            expect(messages.some(m => /Value must be of type "string"/.test(m))).toBe(true)
        })

        it('returns the value (no throw) when strict passes', () => {
            const schema = object({ id: string() }).strict()

            const value = { id: 'abc' }
            expect(() => schema.validator().validate(value)).not.toThrow()
            expect(schema.validator().validate(value)).toEqual(value)
        })
    })

    describe('wildcard object (no tree)', () => {
        it('rejects any non-empty object when object().strict() is called', () => {
            const schema = object().strict()

            expect(schema({})).toBe(true)
            expect(schema({ anyKey: 'anyValue' })).toBe(false)
        })

        it('accepts {} when object().strict() is called', () => {
            const schema = object().strict()

            expect(schema({})).toBe(true)
        })
    })

    describe('nested', () => {
        it('strict on outer object does not affect nested object schemas', () => {
            const schema = object({
                inner: object({ id: string() }),
            }).strict()

            expect(schema({ inner: { id: 'abc' } })).toBe(true)
            expect(schema({ inner: { id: 'abc', extra: 'x' }, unknownKey: true })).toBe(false)
            // outer strict only checks outer keys; inner has no strict, so inner extra keys are allowed
            expect(schema({ inner: { id: 'abc', extra: 'x' } })).toBe(true)
        })

        it('strict on nested object rejects unknown keys in the nested value', () => {
            const schema = object({
                inner: object({ id: string() }).strict(),
            })

            expect(schema({ inner: { id: 'abc' } })).toBe(true)
            expect(schema({ inner: { id: 'abc', extra: 'x' } })).toBe(false)
        })
    })

    describe('metadata introspection', () => {
        it('records Object.strict rule in struct metadata.rules', () => {
            const schema = object({ id: string() }).strict()
            const metadata = getStructMetadata(schema) as any

            expect(Array.isArray(metadata.rules)).toBe(true)
            expect(metadata.rules.length).toBe(1)
        })

        it('getStructMetadata(schema).rules contains the strict rule struct', () => {
            const schema = object({ id: string(), name: string() }).strict()
            const metadata = getStructMetadata(schema) as any
            const strictRuleStruct = metadata.rules.find((r: any) => r.rule === 'Object.strict')

            expect(strictRuleStruct).toBeDefined()
            expect(strictRuleStruct.type).toBe('default')
            expect(strictRuleStruct.args).toEqual([['id', 'name']])
        })
    })
})
