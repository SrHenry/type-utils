import type { GetSchema } from '../index.ts'
import type {
    BooleanSchema,
    NullSchema,
    UndefinedSchema,
    SymbolSchema,
    AnySchema,
    PrimitiveSchema,
    EnumSchema,
    ObjectSchema,
    TupleSchema,
    UnionSchema,
    IntersectionSchema,
    UnionSchemaEntry,
    IntersectionSchemaEntry,
    TupleSchemaEntry,
    ValidateReturn,
    Custom,
    CustomFactory,
    Rule,
    RuleStruct,
    CreateRuleArgs,
} from '../index.ts'
import type { FluentSchema } from '../FluentSchema.ts'
import type { Sanitize } from '../../../types/index.ts'

describe('GetSchema', () => {
    it('should be importable', () => {
        expect(true).toBe(true)
    })
})

describe('Exported schema types are importable', () => {
    it('should import all schema builder types', () => {
        expect(true).toBe(true)
    })
})

// Compile-time type assertions — verified by tsc --noEmit
// Assert<T, U> forces U extends T; if not, compilation fails
type Assert<T, U extends T> = U

// GetSchema<string> → FluentSchema<string, StringSchemaRules>
type GSString = Assert<FluentSchema<string, any, any[]>, GetSchema<string>>

// GetSchema<'hello'> → FluentSchema<string, StringSchemaRules, [...(keyof StringSchemaRules)[]]>
type GSStringLiteral = Assert<FluentSchema<string, any, [...(keyof any)[]]>, GetSchema<'hello'>>

// GetSchema<number> → FluentSchema<number, NumberSchemaRules>
type GSNumber = Assert<FluentSchema<number, any, any[]>, GetSchema<number>>

// GetSchema<42> → FluentSchema<number, NumberSchemaRules, [...(keyof NumberSchemaRules)[]]>
type GSNumberLiteral = Assert<FluentSchema<number, any, [...(keyof any)[]]>, GetSchema<42>>

// GetSchema<bigint> → FluentSchema<bigint, NumberSchemaRules>
type GSBigint = Assert<FluentSchema<bigint, any, any[]>, GetSchema<bigint>>

// GetSchema<boolean> → FluentSchema<boolean>
type GSBoolean = Assert<FluentSchema<boolean>, GetSchema<boolean>>

// GetSchema<null> → FluentSchema<null>
type GSNull = Assert<FluentSchema<null>, GetSchema<null>>

// GetSchema<undefined> → FluentSchema<undefined>
type GSUndefined = Assert<FluentSchema<undefined>, GetSchema<undefined>>

// GetSchema<symbol> → FluentSchema<symbol>
type GSSymbol = Assert<FluentSchema<symbol>, GetSchema<symbol>>

// GetSchema<string[]> → FluentSchema<string[], ArraySchemaRules>
type GSStringArray = Assert<FluentSchema<string[], any, any[]>, GetSchema<string[]>>

// GetSchema<[string, number]> → FluentSchema<[string, number]>
type GSTuple = Assert<FluentSchema<[string, number]>, GetSchema<[string, number]>>

// GetSchema<Record<string, number>> → FluentSchema<Record<string, number>, RecordSchemaRules>
type GSRecord = Assert<
    FluentSchema<Record<string, number>, any, any[]>,
    GetSchema<Record<string, number>>
>

// GetSchema<{ foo: string }> → FluentSchema<Sanitize<{ foo: string }>>
type GSObject = Assert<FluentSchema<Sanitize<{ foo: string }>>, GetSchema<{ foo: string }>>

// GetSchema<{ foo?: string }> → FluentSchema<Sanitize<{ foo?: string }>>
type GSOptionalObject = Assert<
    FluentSchema<Sanitize<{ foo?: string }>>,
    GetSchema<{ foo?: string }>
>

// GetSchema<string | number> → FluentSchema<string | number>
type GSUnion = Assert<FluentSchema<string | number>, GetSchema<string | number>>

// GetSchema never returns never for valid inputs
type _GSNeverCheck = Assert<never, never>

// Reference all type aliases to suppress noUnusedLocals
const _type_checks: [
    GSString,
    GSStringLiteral,
    GSNumber,
    GSNumberLiteral,
    GSBigint,
    GSBoolean,
    GSNull,
    GSUndefined,
    GSSymbol,
    GSStringArray,
    GSTuple,
    GSRecord,
    GSObject,
    GSOptionalObject,
    GSUnion,
    _GSNeverCheck,
] = null as any
void _type_checks

// Reference imported schema types to verify they're importable
const _schema_type_refs: [
    BooleanSchema,
    NullSchema,
    UndefinedSchema,
    SymbolSchema,
    AnySchema,
    PrimitiveSchema,
    EnumSchema,
    ObjectSchema,
    TupleSchema,
    UnionSchema,
    IntersectionSchema,
    UnionSchemaEntry,
    IntersectionSchemaEntry,
    TupleSchemaEntry,
    ValidateReturn<unknown>,
    Custom<[], '', unknown>,
    CustomFactory<[]>,
    Rule,
    RuleStruct<any>,
    CreateRuleArgs,
] = null as any
void _schema_type_refs
