import {
    getMessage,
    GetTypeGuards,
    setMessage,
    TypeGuards,
} from '../../TypeGuards/GenericTypeGuards'
import { getRule } from '../rules/helpers'
import { enpipeSchemaStructIntoGuard, getStructMetadata, setOptionalFlag } from './helpers'

import type { Generics } from '../../Generics'
import type { GetTypeGuard, TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import type { ArrayRules } from '../rules/Array'
import type { StringRules } from '../rules/String'
import type { Sanitize, ValidatorMap } from '../Validators'
import type { OptionalizeTypeGuardClosure, TypeGuardClosure, V3 } from './types'

export * from './and'
export * from './any'
export * from './array'
export * from './asEnum'
export * from './asNull'
export * from './asUndefined'
export * from './bigint'
export * from './boolean'
export { hasOptionalFlag } from './helpers'
export * from './number'
export * from './object'
export * from './or'
export * from './primitive'
export * from './string'
export * from './symbol'
export * from './types'
export * from './useSchema'
export { getStructMetadata }

import { Merge } from '../../types'
import { NumberRules } from '../rules/Number'
import { and } from './and'
import { any } from './any'
import { array } from './array'
import { asEnum } from './asEnum'
import { asNull } from './asNull'
import { asUndefined } from './asUndefined'
import { bigint, BigIntRulesConfig } from './bigint'
import { boolean } from './boolean'
import { number, NumberRulesConfig } from './number'
import { object } from './object'
import { or } from './or'
import { primitive } from './primitive'
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
            | 'and'
            | 'or'
            | 'asEnum'
            | 'useSchema'
            | 'number'
            | 'bigint'
        >
    >,
    {
        number(): TypeGuard<number>
        number(rules: Partial<NumberRulesConfig>): TypeGuard<number>
        number(rules: NumberRules[]): TypeGuard<number>

        bigint(): TypeGuard<bigint>
        bigint(rules: Partial<BigIntRulesConfig>): TypeGuard<bigint>
        bigint(rules: NumberRules[]): TypeGuard<bigint>

        string(): OptionalizeTypeGuard<TypeGuard<string>>
        string(rules: StringRules[]): OptionalizeTypeGuard<TypeGuard<string>>
        string<T extends string>(matches: T): OptionalizeTypeGuard<TypeGuard<T>>
        string(regex: RegExp): OptionalizeTypeGuard<TypeGuard<string>>

        array(): OptionalizeTypeGuard<TypeGuard<any[]>>
        array(rules: ArrayRules[]): OptionalizeTypeGuard<TypeGuard<any[]>>
        array<T>(rules: ArrayRules[], schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T[]>>
        array<T>(schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T[]>>

        object<T extends {}>(tree: ValidatorMap<T>): OptionalizeTypeGuard<TypeGuard<Sanitize<T>>>
        // object<T extends ValidatorMap<any>>(
        //     tree: T
        // ): OptionalizeTypeGuard<TypeGuard<GetTypeFromValidatorMap<T>>>
        object(): OptionalizeTypeGuard<TypeGuard<Record<any, any>>>
        object(tree: {}): OptionalizeTypeGuard<TypeGuard<{}>>

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

export function optional(): OptionalSchema {
    const wrapOptional =
        <T extends TypeGuardClosure>(fn: T): OptionalizeTypeGuardClosure<T> =>
        (...args: Parameters<T>) => {
            const closure = (arg: unknown): arg is GetTypeGuard<ReturnType<T>> =>
                getRule('optional')(arg) || fn(...args)(arg)

            setOptionalFlag(closure)
            // closure[__optional__] = true

            return enpipeSchemaStructIntoGuard(
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
