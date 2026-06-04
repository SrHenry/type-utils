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
 * GetSchema<void> → FluentSchema<any>
 * GetSchema<never> → never
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
 * GetSchema<Record<symbol, boolean>> → FluentSchema<Record<symbol, boolean>, RecordSchemaRules>
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
            : // `void` doesn't extend any primitive or Record — map to any schema
              // biome-ignore lint/suspicious/noConfusingVoidType: void used in conditional type check, not as a value type
              [void] extends [T]
                ? FluentSchema<any>
                : // `never` distributes through all branches and collapses — map to never (intentional)
                  [never] extends [T]
                    ? never
                    : // Broad string type → string schema with all rules available
                      [string] extends [T]
                        ? T extends string
                            ? FluentSchema<string, StringSchemaRules>
                            : // Unreachable: [string] extends [T] is only true when T is at least
                              // as wide as string. The only such types are `any` (caught above) and
                              // `unknown` (caught above). The `never` here is a safety fallback.
                              never
                        : T extends string
                          ? // String literal → all rules consumed (exact match overload)
                            FluentSchema<string, StringSchemaRules, [...(keyof StringSchemaRules)[]]>
                          : // Broad number type → number schema with all rules available
                            [number] extends [T]
                            ? T extends number
                                ? FluentSchema<number, NumberSchemaRules>
                                : // Unreachable: same reasoning as the string branch above.
                                  never
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
                                            : // Record (broad-keyed: string, number, or symbol keys) vs specific object
                                              // PropertyKey (= string|number|symbol) can't be used directly because
                                              // `symbol extends string` is false. Instead check each key type individually.
                                              T extends Record<any, any>
                                              ? string extends keyof T
                                                ? FluentSchema<T, RecordSchemaRules>
                                                : number extends keyof T
                                                  ? FluentSchema<T, RecordSchemaRules>
                                                  : symbol extends keyof T
                                                    ? FluentSchema<T, RecordSchemaRules>
                                                    : // Specific object: use Sanitize for optional prop normalization
                                                      FluentSchema<Sanitize<T>>
                                              : never
