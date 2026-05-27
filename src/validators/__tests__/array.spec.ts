import { array, string, object, number, asEnum } from '../schema/index.ts'
import type { TypeGuard } from '../../TypeGuards/index.ts'
import type { Infer } from '../../types/index.ts'
import type { StandardSchemaV1 } from '../standard-schema/types.ts'

function mockStdSchema<T>(
    vendor: string,
    validate: (value: unknown) => value is T
): StandardSchemaV1<T, T> {
    return {
        '~standard': {
            version: 1,
            vendor,
            validate: (value: unknown) => {
                if (validate(value)) return { success: true as const, value }
                return { success: false as const, issues: [{ message: `Expected ${vendor}` }] }
            },
        },
    }
}

describe('array — type inference', () => {
    it('infers string[] from array(string())', () => {
        const schema = array(string())
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<string[]>()
    })

    it('infers number[] from array(number())', () => {
        const schema = array(number())
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<number[]>()
    })

    it('infers object element type from array(object({ ... }))', () => {
        const elementSchema = object({ id: string(), value: string() })
        const schema = array(elementSchema)
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<{ id: string; value: string }[]>()
    })

    it('infers element type from array(StandardSchemaV1)', () => {
        const zodString = mockStdSchema('zod', (v): v is string => typeof v === 'string')
        const schema = array(zodString)
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<string[]>()
    })

    it('infers { id: string }[] from array({ id: string() })', () => {
        const schema = array({ id: string() })
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<{ id: string }[]>()
    })

    it('infers any[] from array()', () => {
        const schema = array()
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<any[]>()
    })

    it('infers string[] from array(string()).optional() — known: | undefined dropped by GetTypeGuard on FluentOptionalSchema', () => {
        const schema = array(string()).optional()
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<string[]>()
    })

    it('infers literal union array from array(asEnum(...))', () => {
        const schema = array(asEnum(['a', 'b', 'c'] as const))
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<('a' | 'b' | 'c')[]>()
    })

    it('infers element type from array(custom TypeGuard)', () => {
        const isPoint: TypeGuard<{ x: number; y: number }> = (
            v: unknown,
        ): v is { x: number; y: number } =>
            typeof v === 'object' && v !== null && 'x' in v && 'y' in v
        const schema = array(isPoint)
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<{ x: number; y: number }[]>()
    })
})

describe('array — runtime behavior preserved', () => {
    it('validates string elements', () => {
        const schema = array(string())
        expect(schema(['a', 'b'])).toBe(true)
        expect(schema(['a', 1])).toBe(false)
        expect(schema([1, 2])).toBe(false)
    })

    it('validates object elements', () => {
        const schema = array(object({ id: string() }))
        expect(schema([{ id: 'x' }])).toBe(true)
        expect(schema([{ id: 1 }])).toBe(false)
    })

    it('validates ValidatorMap tree elements', () => {
        const schema = array({ id: string() })
        expect(schema([{ id: 'x' }])).toBe(true)
        expect(schema([{ id: 1 }])).toBe(false)
    })

    it('validates StandardSchemaV1 elements', () => {
        const zodString = mockStdSchema('zod', (v): v is string => typeof v === 'string')
        const schema = array(zodString)
        expect(schema(['a', 'b'])).toBe(true)
        expect(schema(['a', 1])).toBe(false)
    })
})
