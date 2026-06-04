import type { FluentSchema } from './FluentSchema.ts'
import type { StringRules } from '../../rules/String/index.ts'
import type { NumberRules } from '../../rules/Number/index.ts'
import type { ArrayRules } from '../../rules/Array/index.ts'
import type { RecordRules } from '../../rules/Record/index.ts'
import type { Sanitize } from '../../types/index.ts'

type StringSchemaRules = Omit<typeof StringRules, 'optional'>
type NumberSchemaRules = Omit<typeof NumberRules, 'optional'>
type ArraySchemaRules = Omit<typeof ArrayRules, 'optional'>
type RecordSchemaRules = Omit<typeof RecordRules, 'optional'>

/**
 * Maps a TypeScript type T to the FluentSchema result type you'd get from
 * calling the corresponding schema builder function.
 *
 * @example
 * GetSchema<any> → FluentSchema<any>
 * GetSchema<unknown> → FluentSchema<any>
 * GetSchema<string> → FluentSchema<string, StringSchemaRules>
 * GetSchema<'hello'> → FluentSchema<string, StringSchemaRules, [...(keyof StringSchemaRules)[]]>
 * GetSchema<number> → FluentSchema<number, NumberSchemaRules>
 * GetSchema<bigint> → FluentSchema<bigint, NumberSchemaRules>
 * GetSchema<boolean> → FluentSchema<boolean>
 * GetSchema<null> → FluentSchema<null>
 * GetSchema<undefined> → FluentSchema<undefined>
 * GetSchema<symbol> → FluentSchema<symbol>
 * GetSchema<string[]> → FluentSchema<string[], ArraySchemaRules>
 * GetSchema<[string, number]> → FluentSchema<[string, number]>
 * GetSchema<Record<string, number>> → FluentSchema<Record<string, number>, RecordSchemaRules>
 * GetSchema<Record<number, string>> → FluentSchema<Record<number, string>, RecordSchemaRules>
 * GetSchema<{ foo: string }> → FluentSchema<{ foo: string }>
 * GetSchema<{ foo?: string }> → FluentSchema<{ foo?: string }>
 * GetSchema<string | number> → FluentSchema<string | number>
 */
export type GetSchema<T> =
    // `any` distributes through every branch — detect it first to avoid mis-mapping
    0 extends 1 & T
        ? FluentSchema<any>
        : // `unknown` extends nothing useful but also isn't a primitive — map to any schema
          unknown extends T
          ? FluentSchema<any>
          : // Broad string type → string schema with all rules available
            [string] extends [T]
            ? T extends string
                ? FluentSchema<string, StringSchemaRules>
                : never
            : T extends string
              ? // String literal → all rules consumed (exact match overload)
                FluentSchema<string, StringSchemaRules, [...(keyof StringSchemaRules)[]]>
              : // Broad number type → number schema with all rules available
                [number] extends [T]
                ? T extends number
                    ? FluentSchema<number, NumberSchemaRules>
                    : never
                : T extends number
                  ? // Numeric literal → all rules consumed
                    FluentSchema<number, NumberSchemaRules, [...(keyof NumberSchemaRules)[]]>
                  : T extends bigint
                    ? FluentSchema<bigint, NumberSchemaRules>
                    : T extends boolean
                      ? FluentSchema<boolean>
                      : T extends null
                        ? FluentSchema<null>
                        : T extends undefined
                          ? FluentSchema<undefined>
                          : T extends symbol
                            ? FluentSchema<symbol>
                            : // Tuple: checked before array (readonly [...] catches tuples but not generic arrays)
                              T extends readonly [infer _A, ...infer _B]
                              ? FluentSchema<T>
                              : // Array: generic T[]
                                T extends (infer U)[]
                                ? FluentSchema<U[], ArraySchemaRules>
                                : // Record (broad key: string, number, or symbol) vs specific object
                                  T extends Record<any, any>
                                  ? PropertyKey extends keyof T
                                      ? FluentSchema<T, RecordSchemaRules>
                                      : // Specific object: use Sanitize for optional prop normalization
                                        FluentSchema<Sanitize<T>>
                                  : never
