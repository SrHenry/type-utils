import { enpipeSchemaStructIntoGuard, getStructMetadata, setOptionalFlag } from './helpers'
import { getMessage, setMessage } from '../../TypeGuards/GenericTypeGuards'
import { getRule } from '../rules/helpers'

import type { OptionalizeTypeGuardClosure, TypeGuardClosure } from './types'
import type { GetTypeGuard, TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import type { Generics } from '../../Generics'
import type { StringRules as StringRules } from '../rules/String'
import type { ArrayRules as ArrayRules } from '../rules/Array'
import type { Sanitize, ValidatorMap } from '../Validators'

export * from './and'
export * from './any'
export * from './array'
export * from './asEnum'
export * from './asNull'
export * from './asUndefined'
export * from './boolean'
export * from './number'
export * from './object'
export * from './or'
export * from './primitive'
export * from './string'
export * from './symbol'
export * from './types'
export * from './useSchema'

export { hasOptionalFlag } from './helpers'

import { and } from './and'
import { any } from './any'
import { array } from './array'
import { asEnum } from './asEnum'
import { asNull } from './asNull'
import { asUndefined } from './asUndefined'
import { boolean } from './boolean'
import { number } from './number'
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
    object,
    or,
    primitive,
    string,
    symbol,
    useSchema,
    optional,
    getStructMetadata,
}

export { getStructMetadata }

type Optionalize<T> = {
    [K in keyof T]: T[K] extends () => TypeGuard<any | any[]>
        ? (...args: Parameters<T[K]>) => OptionalizeTypeGuard<ReturnType<T[K]>>
        : T[K]
}

type OptionalizeTypeGuard<T extends TypeGuard<any | any[]>> = TypeGuard<GetTypeGuard<T> | undefined>

export type optionalCircular = Optionalize<
    Omit<
        typeof Schema,
        | 'optional'
        | 'string'
        | 'array'
        | 'object'
        | 'and'
        | 'or'
        | 'asEnum'
        | 'useSchema'
        | 'SchemaStruct'
        | 'Struct'
        | 'getStructMetadata'
    >
> & {
    string(): OptionalizeTypeGuard<TypeGuard<string>>
    string(rules: StringRules[]): OptionalizeTypeGuard<TypeGuard<string>>
    string<T extends string>(matches: T): OptionalizeTypeGuard<TypeGuard<T>>
    string(regex: RegExp): OptionalizeTypeGuard<TypeGuard<string>>

    array(): OptionalizeTypeGuard<TypeGuard<any[]>>
    array(rules: ArrayRules[]): OptionalizeTypeGuard<TypeGuard<any[]>>
    array<T>(rules: ArrayRules[], schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T[]>>
    array<T>(schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T[]>>

    object<T>(tree: ValidatorMap<T>): OptionalizeTypeGuard<TypeGuard<Sanitize<T>>>
    object(): OptionalizeTypeGuard<TypeGuard<Record<any, any>>>
    object(tree: {}): OptionalizeTypeGuard<TypeGuard<{}>>

    and<T1, T2>(
        guard1: TypeGuard<T1>,
        guard2: TypeGuard<T2>
    ): OptionalizeTypeGuard<TypeGuard<T1 & T2>>
    and<T1, T2, T3>(
        guard1: TypeGuard<T1>,
        guard2: TypeGuard<T2>,
        guard3: TypeGuard<T3>
    ): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3>>
    and<T1, T2, T3, T4>(
        guard1: TypeGuard<T1>,
        guard2: TypeGuard<T2>,
        guard3: TypeGuard<T3>,
        guard4: TypeGuard<T4>
    ): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3 & T4>>
    and<T1, T2, T3, T4, T5>(
        guard1: TypeGuard<T1>,
        guard2: TypeGuard<T2>,
        guard3: TypeGuard<T3>,
        guard4: TypeGuard<T4>,
        guard5: TypeGuard<T5>
    ): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3 & T4 & T5>>
    and<T extends TypeGuard<any>>(
        ...args: T[]
    ): OptionalizeTypeGuard<TypeGuard<GetTypeGuard<Generics.UnionToIntersection<T>>>>

    or<T1, T2>(
        guard1: TypeGuard<T1>,
        guard2: TypeGuard<T2>
    ): OptionalizeTypeGuard<TypeGuard<T1 | T2>>
    or<T1, T2, T3>(
        guard1: TypeGuard<T1>,
        guard2: TypeGuard<T2>,
        guard3: TypeGuard<T3>
    ): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3>>
    or<T1, T2, T3, T4>(
        guard1: TypeGuard<T1>,
        guard2: TypeGuard<T2>,
        guard3: TypeGuard<T3>,
        guard4: TypeGuard<T4>
    ): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3 | T4>>
    or<T1, T2, T3, T4, T5>(
        guard1: TypeGuard<T1>,
        guard2: TypeGuard<T2>,
        guard3: TypeGuard<T3>,
        guard4: TypeGuard<T4>,
        guard5: TypeGuard<T5>
    ): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3 | T4 | T5>>
    or<T extends TypeGuard<any>>(...args: T[]): OptionalizeTypeGuard<TypeGuard<GetTypeGuard<T>>>

    asEnum<T extends Generics.PrimitiveType>(values: T[]): OptionalizeTypeGuard<TypeGuard<T>>
    useSchema<T>(schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T>>
}

export function optional(): optionalCircular {
    const wrapOptional =
        <T extends TypeGuardClosure>(fn: T): OptionalizeTypeGuardClosure<T> =>
        (...args: Parameters<T>) => {
            const closure = (arg: unknown): arg is GetTypeGuard<ReturnType<T>> =>
                getRule('optional')(arg) || fn(...args)(arg)

            setOptionalFlag(closure)
            // closure[__optional__] = true

            return enpipeSchemaStructIntoGuard(
                { ...getStructMetadata(fn(...args)), optional: true },
                setMessage(getMessage(fn(...args)), closure)
            )
        }

    return Array.from(Object.entries(Schema))
        .filter(
            (
                entry
            ): entry is [
                string,
                Exclude<typeof entry[1], typeof optional | typeof getStructMetadata>
            ] => {
                const [, exported] = entry
                return exported !== optional && exported !== getStructMetadata
            }
        )
        .reduce<optionalCircular>(
            (obj, [key, exp]) =>
                Object.assign(obj, { [key]: wrapOptional(exp) }) as optionalCircular,
            {} as optionalCircular
        )
}
