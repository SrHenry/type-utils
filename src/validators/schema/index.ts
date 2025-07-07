import type { Generics } from '../../Generics'
import type { GetTypeGuard, GetTypeGuards, TypeGuard, TypeGuards } from '../../TypeGuards/types'
import type { Merge } from '../../types'
import type { ArrayRule } from '../rules/Array'
import type { NumberRule } from '../rules/Number'
import type { RecordRule } from '../rules/Record'
import type { StringRule } from '../rules/String'
import type { Sanitize, ValidatorMap } from '../types'
import type { OptionalizeTypeGuardClosure, TypeGuardClosure, V3 } from './types'

import { getRule } from '../rules/helpers/getRule'
import { getStructMetadata } from './helpers/getStructMetadata'
import { setOptionalFlag } from './helpers/optionalFlag'

export type * from './types'

export { and } from './and'
export { any } from './any'
export { array } from './array'
export { asEnum } from './asEnum'
export { asNull } from './asNull'
export { asUndefined } from './asUndefined'
export { bigint } from './bigint'
export { boolean } from './boolean'
export { hasOptionalFlag } from './helpers/optionalFlag'
export { number } from './number'
export { object } from './object'
export { or } from './or'
export { primitive } from './primitive'
export { record } from './record'
export { string } from './string'
export { symbol } from './symbol'
export { useSchema } from './useSchema'
export { getStructMetadata }

import { getMessage } from '../../TypeGuards/helpers/getMessage'
import { setMessage } from '../../TypeGuards/helpers/setMessage'

import { and } from './and'
import { any } from './any'
import { array } from './array'
import { asEnum } from './asEnum'
import { asNull } from './asNull'
import { asUndefined } from './asUndefined'
import { bigint, type BigIntRulesConfig } from './bigint'
import { boolean } from './boolean'
import { setStructMetadata } from './helpers/setStructMetadata'
import { number, type NumberRulesConfig } from './number'
import { object } from './object'
import { or } from './or'
import { primitive } from './primitive'
import { record } from './record'
import { string } from './string'
import { symbol } from './symbol'
import { useSchema } from './useSchema'

export const Schema = {
    and,
    any,
    array,
    asEnum,
    asNull,
    asUndefined,
    boolean,
    number,
    bigint,
    object,
    record,
    or,
    primitive,
    string,
    symbol,
    useSchema,
    optional,
    getStructMetadata,
}
type Schema = typeof Schema

type Optionalize<T> = {
    [K in keyof T]: T[K] extends () => TypeGuard<any | any[]>
        ? (...args: Parameters<T[K]>) => OptionalizeTypeGuard<ReturnType<T[K]>>
        : T[K]
}

type OptionalizeTypeGuard<T extends TypeGuard<any | any[]>> = TypeGuard<GetTypeGuard<T> | undefined>

export type OptionalSchema = Merge<
    Optionalize<
        Omit<
            typeof Schema,
            | 'optional'
            | 'getStructMetadata'
            | 'string'
            | 'array'
            | 'object'
            | 'record'
            | 'and'
            | 'or'
            | 'asEnum'
            | 'useSchema'
            | 'number'
            | 'bigint'
        >
    >,
    {
        number(): OptionalizeTypeGuard<TypeGuard<number>>
        number(rules: Partial<NumberRulesConfig>): OptionalizeTypeGuard<TypeGuard<number>>
        number(rules: NumberRule[]): OptionalizeTypeGuard<TypeGuard<number>>

        bigint(): OptionalizeTypeGuard<TypeGuard<bigint>>
        bigint(rules: Partial<BigIntRulesConfig>): OptionalizeTypeGuard<TypeGuard<bigint>>
        bigint(rules: NumberRule[]): OptionalizeTypeGuard<TypeGuard<bigint>>

        string(): OptionalizeTypeGuard<TypeGuard<string>>
        string(rules: StringRule[]): OptionalizeTypeGuard<TypeGuard<string>>
        string<T extends string>(matches: T): OptionalizeTypeGuard<TypeGuard<T>>
        string(regex: RegExp): OptionalizeTypeGuard<TypeGuard<string>>

        array(): OptionalizeTypeGuard<TypeGuard<any[]>>
        array(rules: ArrayRule[]): OptionalizeTypeGuard<TypeGuard<any[]>>
        array<T>(rules: ArrayRule[], schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T[]>>
        array<T>(schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T[]>>

        object<T extends {}>(tree: ValidatorMap<T>): OptionalizeTypeGuard<TypeGuard<Sanitize<T>>>
        // object<T extends ValidatorMap<any>>(
        //     tree: T
        // ): OptionalizeTypeGuard<TypeGuard<GetTypeFromValidatorMap<T>>>
        object(): OptionalizeTypeGuard<TypeGuard<Record<any, any>>>
        object(tree: {}): OptionalizeTypeGuard<TypeGuard<{}>>

        record(): OptionalizeTypeGuard<TypeGuard<Record<string, any>>>
        // record(rules: Partial<Rules>): OptionalizeTypeGuard<TypeGuard<Record<string, any>>>
        record(rules: RecordRule[]): OptionalizeTypeGuard<TypeGuard<Record<string, any>>>
        record<K extends keyof any, T>(
            keyGuard: TypeGuard<K>,
            valueGuard: TypeGuard<T>
        ): OptionalizeTypeGuard<TypeGuard<Record<K, T>>>
        // record<K extends keyof any, T>(
        //     keyGuard: TypeGuard<K>,
        //     valueGuard: TypeGuard<T>,
        //     rules: Partial<Rules>
        // ): OptionalizeTypeGuard<TypeGuard<Record<K, T>>>
        record<K extends keyof any, T>(
            keyGuard: TypeGuard<K>,
            valueGuard: TypeGuard<T>,
            rules: RecordRule[]
        ): OptionalizeTypeGuard<TypeGuard<Record<K, T>>>

        and<T1, T2>(
            guard1: TypeGuard<T1>,
            guard2: TypeGuard<T2>
        ): OptionalizeTypeGuard<TypeGuard<Merge<T1, T2>>>
        and<TGuards extends TypeGuards<any>>(
            ...guards: TGuards
        ): TypeGuard<V3.TIntersection<GetTypeGuards<TGuards>>>
        // and<T1, T2, T3>(
        //     guard1: TypeGuard<T1>,
        //     guard2: TypeGuard<T2>,
        //     guard3: TypeGuard<T3>
        // ): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3>>
        // and<T1, T2, T3, T4>(
        //     guard1: TypeGuard<T1>,
        //     guard2: TypeGuard<T2>,
        //     guard3: TypeGuard<T3>,
        //     guard4: TypeGuard<T4>
        // ): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3 & T4>>
        // and<T1, T2, T3, T4, T5>(
        //     guard1: TypeGuard<T1>,
        //     guard2: TypeGuard<T2>,
        //     guard3: TypeGuard<T3>,
        //     guard4: TypeGuard<T4>,
        //     guard5: TypeGuard<T5>
        // ): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3 & T4 & T5>>
        // and<T extends TypeGuard<any>>(
        //     ...args: T[]
        // ): OptionalizeTypeGuard<TypeGuard<GetTypeGuard<Generics.UnionToIntersection<T>>>>

        or<T1, T2>(
            guard1: TypeGuard<T1>,
            guard2: TypeGuard<T2>
        ): OptionalizeTypeGuard<TypeGuard<T1 | T2>>
        or<TGuards extends TypeGuards<any>>(
            ...guards: TGuards
        ): TypeGuard<V3.TUnion<GetTypeGuards<TGuards>>>
        // or<T1, T2, T3>(
        //     guard1: TypeGuard<T1>,
        //     guard2: TypeGuard<T2>,
        //     guard3: TypeGuard<T3>
        // ): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3>>
        // or<T1, T2, T3, T4>(
        //     guard1: TypeGuard<T1>,
        //     guard2: TypeGuard<T2>,
        //     guard3: TypeGuard<T3>,
        //     guard4: TypeGuard<T4>
        // ): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3 | T4>>
        // or<T1, T2, T3, T4, T5>(
        //     guard1: TypeGuard<T1>,
        //     guard2: TypeGuard<T2>,
        //     guard3: TypeGuard<T3>,
        //     guard4: TypeGuard<T4>,
        //     guard5: TypeGuard<T5>
        // ): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3 | T4 | T5>>
        // or<T extends TypeGuard<any>>(...args: T[]): OptionalizeTypeGuard<TypeGuard<GetTypeGuard<T>>>

        asEnum<T extends Generics.PrimitiveType>(values: T[]): OptionalizeTypeGuard<TypeGuard<T>>
        useSchema<T>(schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T>>
    }
>

///! TODO: Remove global optional and place it as an optional method inside the library's default schemas:
///! E.g.: `number().optional()` or `number.optional()`
///! This will allow users to use the `optional` method without importing it directly.

export function optional(): OptionalSchema {
    const wrapOptional =
        <T extends TypeGuardClosure>(fn: T): OptionalizeTypeGuardClosure<T> =>
        (...args: Parameters<T>) => {
            const closure = (arg: unknown): arg is GetTypeGuard<ReturnType<T>> =>
                getRule('optional')(arg) || fn(...args)(arg)

            setOptionalFlag(closure)
            // closure[__optional__] = true

            return setStructMetadata(
                { ...getStructMetadata(fn(...args)), optional: true } as unknown as
                    | V3.GenericStruct<T>
                    | V3.AnyStruct,
                setMessage(getMessage(fn(...args)), closure)
            )
        }

    type Guards = Omit<Schema, 'optional' | 'getStructMetadata'>
    type SchemaEntry = Entry<Guards>

    const filterGuards = ([, exported]: ObjectEntry<Schema>) =>
        exported !== optional && exported !== getStructMetadata

    return Object.entries(Schema)
        .filter(filterGuards as TypeGuard<SchemaEntry>)
        .reduce<OptionalSchema>(
            (obj, [key, exp]) => Object.assign(obj, { [key]: wrapOptional(exp) }),
            {} as OptionalSchema
        )
}
