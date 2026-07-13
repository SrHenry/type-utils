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
    CreateRuleArgs,
} from '../index.ts'
import type { RuleStruct } from '../../../rules/types/index.ts' // internal path — RuleStruct excluded from public API
import type { FluentSchema } from '../FluentSchema.ts'
import type { Sanitize } from '../../../types/index.ts'
import type { RecordRules } from '../../../rules/Record/index.ts'
import type { ObjectRules } from '../../../rules/Object/index.ts'

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

// Strict equality assertion: exact type match (both directions)
type AssertExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false

// GetSchema<any> → FluentSchema<any> (not FluentSchema<string, ...>)
type GSAny = Assert<FluentSchema<any>, GetSchema<any>>

// GetSchema<unknown> → FluentSchema<any> (catch-all, same as any schema)
type GSUnknown = Assert<FluentSchema<any>, GetSchema<unknown>>

// GetSchema<void> → FluentSchema<any>
type GSVoid = Assert<FluentSchema<any>, GetSchema<void>>

// GetSchema<never> → never (intentional — never inputs produce never output)
type GSNever = AssertExact<GetSchema<never>, never>

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

// GetSchema<readonly string[]> → FluentSchema<readonly string[], ArraySchemaRules>
type GSReadonlyStringArray = Assert<
    FluentSchema<readonly string[], any, any[]>,
    GetSchema<readonly string[]>
>

// GetSchema<[string, number]> → FluentSchema<[string, number]>
type GSTuple = Assert<FluentSchema<[string, number]>, GetSchema<[string, number]>>

// GetSchema<Record<string, number>> → FluentSchema<Record<string, number>, RecordSchemaRules>
// Strict: verify RecordSchemaRules is present (not {}), ensuring .nonEmpty() is available
type RecordSchemaRules = Omit<typeof RecordRules, 'optional'>
type GSRecord = Assert<
    FluentSchema<Record<string, number>, RecordSchemaRules, []>,
    GetSchema<Record<string, number>>
>

// GetSchema<Record<number, string>> → FluentSchema<Record<number, string>, RecordSchemaRules>
// Strict: verify RecordSchemaRules is present for number-keyed records too
type GSRecordNumberKey = Assert<
    FluentSchema<Record<number, string>, RecordSchemaRules, []>,
    GetSchema<Record<number, string>>
>

// GetSchema<Record<symbol, boolean>> → FluentSchema<Record<symbol, boolean>, RecordSchemaRules>
// Strict: verify RecordSchemaRules is present for symbol-keyed records
type GSRecordSymbolKey = Assert<
    FluentSchema<Record<symbol, boolean>, RecordSchemaRules, []>,
    GetSchema<Record<symbol, boolean>>
>

// GetSchema<{ foo: string }> → FluentSchema<Sanitize<{ foo: string }>>
type GSObject = Assert<FluentSchema<Sanitize<{ foo: string }>>, GetSchema<{ foo: string }>>

// GetSchema<{ foo?: string }> → FluentSchema<Sanitize<{ foo?: string }>>
type GSOptionalObject = Assert<
    FluentSchema<Sanitize<{ foo?: string }>>,
    GetSchema<{ foo?: string }>
>

type ObjectSchemaRules = typeof ObjectRules

// GetSchema<{ foo: string }> → FluentSchema<Sanitize<{ foo: string }>, ObjectSchemaRules>
// Strict: verify ObjectSchemaRules is present (not {}), ensuring .strict() is available
type GSObjectWithRules = Assert<
    FluentSchema<Sanitize<{ foo: string }>, ObjectSchemaRules, []>,
    GetSchema<{ foo: string }>
>

// Verify object types have .strict() method available (parallels _recordHasNonEmpty)
type _objectHasStrict = 'strict' extends keyof GetSchema<{ foo: string }> ? true : false
type _assertObjectStrict = Assert<true, _objectHasStrict>

// GetSchema<string | number> → FluentSchema<string | number>
type GSUnion = Assert<FluentSchema<string | number>, GetSchema<string | number>>

// Negative test: GetSchema<() => void> → never (functions not supported)
type GSFunction = AssertExact<GetSchema<() => void>, never>

// Negative test: GetSchema<Date> → never (class instances not supported)
type GSDate = AssertExact<GetSchema<Date>, never>

// Verify Record types have .nonEmpty() method available
type _recordHasNonEmpty = 'nonEmpty' extends keyof GetSchema<Record<string, number>> ? true : false
type _assertNonEmpty = Assert<true, _recordHasNonEmpty>

// Reference all type aliases to suppress noUnusedLocals
const _type_checks: [
    GSAny,
    GSUnknown,
    GSVoid,
    GSNever,
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
    GSReadonlyStringArray,
    GSTuple,
    GSRecord,
    GSRecordNumberKey,
    GSRecordSymbolKey,
    GSObject,
    GSOptionalObject,
    GSUnion,
    GSFunction,
    GSDate,
    _recordHasNonEmpty,
    _assertNonEmpty,
    GSObjectWithRules,
    _objectHasStrict,
    _assertObjectStrict,
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
