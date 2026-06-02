import { isNativeSchema } from '../isNativeSchema.ts'
import { string } from '../../../schema/string.ts'
import { number } from '../../../schema/number.ts'
import { object } from '../../../schema/object.ts'
import type { StandardSchemaV1 } from '../../../standard-schema/types.ts'

describe('isNativeSchema', () => {
    it('should return true for a string schema', () => {
        expect(isNativeSchema(string())).toBe(true)
    })

    it('should return true for a number schema', () => {
        expect(isNativeSchema(number())).toBe(true)
    })

    it('should return true for an object schema', () => {
        expect(isNativeSchema(object({ name: string() }))).toBe(true)
    })

    it('should return true for a fluent schema with rules', () => {
        expect(isNativeSchema(string().min(3))).toBe(true)
    })

    it('should return true for an optional schema', () => {
        expect(isNativeSchema(string().optional())).toBe(true)
    })

    it('should return false for an external StandardSchemaV1 object', () => {
        const externalSchema: StandardSchemaV1<string> = {
            '~standard': {
                version: 1,
                vendor: 'zod',
                validate: (value: unknown) => {
                    if (typeof value === 'string') return { success: true as const, value }
                    return {
                        success: false as const,
                        issues: [{ message: 'Expected string' }],
                    }
                },
            },
        }
        expect(isNativeSchema(externalSchema)).toBe(false)
    })

    it('should return false for a plain function', () => {
        expect(isNativeSchema((value: unknown) => typeof value === 'string')).toBe(false)
    })

    it('should return false for null', () => {
        expect(isNativeSchema(null)).toBe(false)
    })

    it('should return false for undefined', () => {
        expect(isNativeSchema(undefined)).toBe(false)
    })

    it('should return false for a primitive', () => {
        expect(isNativeSchema(42)).toBe(false)
        expect(isNativeSchema('hello')).toBe(false)
    })
})
