import { AND } from '../../helpers'
import { keys as RuleKeys } from '../rules/constants'
import { getRule, isCustomHandler, isRule } from '../rules/helpers'

import {
    getMessageFormator,
    getMetadata,
    hasMetadata,
    imprintMessage,
    isTypeGuard,
    isUnaryFunction,
    setAsTypeGuard,
    setMessageFormator,
    setMetadata,
} from '../../TypeGuards/GenericTypeGuards'

import Generics from '../../Generics'
import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import { Predicate } from '../../types/Predicate'
import { template as ruleTemplate } from '../rules/common'
import type { Optional as OptionalRule } from '../rules/optional'
import type {
    All as AllRules,
    Custom as CustomRule,
    Default as DefaultRules,
    Rule,
} from '../rules/types'
import { baseTypes } from './constants'
import type { Exact, GenericStruct, ObjectStruct, V3 } from './types'

const __metadata__ = Symbol('__metadata__')
const __optional__ = Symbol('__optional__')

export const isOptional = (rule: AllRules): rule is OptionalRule =>
    rule[0] in RuleKeys && rule[0] === RuleKeys.optional
export const isRequired = (rule: AllRules): rule is Exclude<AllRules, OptionalRule> =>
    !isOptional(rule)
export const branchIfOptional = (arg: unknown, rules: AllRules[]) =>
    rules.some(isOptional) ? getRule(rules.find(isOptional)![0]).call(null, arg) : false

export function isFollowingRules<Custom extends CustomRule>(
    arg: unknown,
    rules: CustomRule<Custom[1], Custom[0]>[]
): boolean
export function isFollowingRules<Args extends any[], RuleName extends string>(
    arg: unknown,
    rules: CustomRule<Args, RuleName>[]
): boolean
export function isFollowingRules(arg: unknown, rules: DefaultRules[]): boolean
export function isFollowingRules(arg: unknown, rules: unknown[]): boolean {
    return AND(
        ...rules
            .filter(isRule)
            .filter(isRequired)
            .map(r => {
                const [rule, args, handler] = r

                if (isCustomHandler(handler)) {
                    return handler(arg).call(null, ...args)
                } else {
                    return getRule<DefaultRules[0], Rule>(rule as DefaultRules[0]).call(
                        null,
                        arg,
                        ...args
                    )
                }
            })
    )
}

export const _hasOptionalProp = (schema: TypeGuard): boolean => {
    const hasFlag = (o: unknown) => hasMetadata(__optional__, o)

    return hasFlag(schema)
}

export const hasOptionalFlag = <T>(subject: T) => hasMetadata(__optional__, subject)
export const setOptionalFlag = <T>(subject: T) => setMetadata(__optional__, true, subject)

export const getRuleMessages = (rules: DefaultRules[]) =>
    rules
        .map(([rule, args]) => ({ rule: getRule(rule), args }))
        .map(({ rule, args }) => `${getMessageFormator(rule)(...args)}`)

export function enpipeRuleMessageIntoGuard<T>(prepend: string, guard: TypeGuard<T>): typeof guard
export function enpipeRuleMessageIntoGuard<T>(
    prepend: string,
    guard: TypeGuard<T>,
    rules: DefaultRules[]
): typeof guard
export function enpipeRuleMessageIntoGuard<T>(
    prepend: string,
    guard: TypeGuard<T>,
    rules?: DefaultRules[]
) {
    const message = getRuleMessages(rules ?? []).join(' & ')

    if (getRule('String.nonEmpty')(message)) return imprintMessage(`${prepend} & ${message}`, guard)

    return imprintMessage(prepend, guard)
}

// export function enpipeSchemaStructIntoGuard<T>(struct: Struct<T>, guard: TypeGuard<T>): typeof guard
// export function enpipeSchemaStructIntoGuard<T extends Struct>(
//     struct: T,
//     guard: T['schema']
// ): typeof guard
// export function enpipeSchemaStructIntoGuard<T>(
//     struct: GenericStruct<T>,
//     guard: TypeGuard<T>
// ): typeof guard
// export function enpipeSchemaStructIntoGuard<T extends StructType, U>(
//     struct: T,
//     guard: TypeGuard<U>
// ): typeof guard
// export function enpipeSchemaStructIntoGuard<T extends Struct<U>, U>(
//     struct: T,
//     guard: TypeGuard<U>
// ): typeof guard
// export function enpipeSchemaStructIntoGuard<T extends GenericStruct<U>, U>(
//     struct: T,
//     guard: TypeGuard<U>
// ): typeof guard

// export function enpipeSchemaStructIntoGuard<TStruct extends V3.Struct<any>>(
//     struct: TStruct,
//     guard: TypeGuard<V3.FromStruct<TStruct>>
// ): typeof guard
// export function enpipeSchemaStructIntoGuard<TStruct extends V3.UnionStruct<any[]>>(
//     struct: TStruct,
//     guard: TypeGuard<V3.FromUnionStruct<TStruct>>
// ): typeof guard
// export function enpipeSchemaStructIntoGuard<TStruct extends V3.IntersectionStruct<any[]>>(
//     struct: TStruct,
//     guard: TypeGuard<V3.FromIntersectionStruct<TStruct>>
// ): typeof guard
export function enpipeSchemaStructIntoGuard<TSource>(
    struct: V3.GenericStruct<TSource, false>,
    guard: TypeGuard<TSource>
): typeof guard
export function enpipeSchemaStructIntoGuard<TSource extends Generics.PrimitiveType>(
    struct: V3.EnumStruct<TSource>,
    guard: TypeGuard<TSource>
): typeof guard
export function enpipeSchemaStructIntoGuard(
    struct: V3.PrimitiveStruct,
    guard: TypeGuard<Generics.PrimitiveType>
): typeof guard
export function enpipeSchemaStructIntoGuard<TSource extends {}>(
    struct: V3.ObjectStruct<TSource>,
    guard: TypeGuard<TSource>
): typeof guard
export function enpipeSchemaStructIntoGuard<TStruct extends V3.UnionStruct<any[]>>(
    struct: TStruct,
    guard: TypeGuard<V3.FromUnionStruct<TStruct>>
): typeof guard
export function enpipeSchemaStructIntoGuard<TStruct extends V3.IntersectionStruct<any[]>>(
    struct: TStruct,
    guard: TypeGuard<V3.FromIntersectionStruct<TStruct>>
): typeof guard
// export function enpipeSchemaStructIntoGuard<T>(
//     struct: BaseStruct<BaseTypes, T>,
//     guard: TypeGuard<T>
// ): typeof guard

export function enpipeSchemaStructIntoGuard<T>(
    struct: V3.GenericStruct<T>,
    guard: TypeGuard<T>
): typeof guard {
    return setMetadata(__metadata__, struct, guard)
}

// aliases:
export const setStructMetadata = enpipeSchemaStructIntoGuard
export const setRuleMessage = enpipeRuleMessageIntoGuard

export function getStructMetadata<U>(guard: TypeGuard<U>): V3.GenericStruct<U> | V3.AnyStruct {
    return (
        getMetadata(__metadata__, guard) ?? {
            type: 'any',
            optional: false,
            schema: guard,
        }
    )
}

export function hasStructMetadata(guard: TypeGuard): boolean {
    return hasMetadata(__metadata__, guard)
}

export const exactFormator = (to: unknown) => ruleTemplate(`exact '${to}'`)
export const exact = <T>(to: T): Exact<T> => [
    '__Custom.exact__',
    [to],
    setMessageFormator(exactFormator, subject => arg => subject === arg),
]

export function isStruct(struct: unknown): struct is GenericStruct<any>
export function isStruct<T, IsGeneric extends true | false = true>(
    struct: unknown,
    schema: TypeGuard<T>
): struct is GenericStruct<T, IsGeneric>
export function isStruct<T>(struct: unknown, schema: TypeGuard<T>): struct is GenericStruct<T>
export function isStruct(struct: unknown, schema?: TypeGuard): struct is GenericStruct<any>

export function isStruct(struct: unknown, schema?: TypeGuard): struct is GenericStruct<any> {
    if (!struct || typeof struct !== 'object') return false
    if (!('type' in struct) || !baseTypes.includes((struct as any)?.type)) return false
    if (!('optional' in struct) || typeof (struct as any)?.optional !== 'boolean') return false
    if (!('schema' in struct) || !isTypeGuard((struct as any).schema)) return false
    if (!!schema && (struct as any).schema !== schema) return false

    return true
}

export function isObjectStruct(struct: unknown): struct is ObjectStruct<any>
export function isObjectStruct<T>(struct: unknown, schema: TypeGuard<T>): struct is ObjectStruct<T>

export function isObjectStruct<T>(
    struct: unknown,
    schema?: TypeGuard<T>
): struct is ObjectStruct<any> {
    if (!isStruct(struct, schema)) return false
    if (
        !('tree' in struct) ||
        !struct?.tree ||
        typeof struct.tree === 'object' ||
        !Object.values(struct.tree).every(isStruct)
    )
        return false

    return true
}

export function createTypeGuard<T>(predicate: Predicate<T>): TypeGuard<T> {
    if (!isUnaryFunction<TypeGuard>(predicate))
        throw new Error('predicate must be a unary function')

    return setAsTypeGuard(predicate)
}
export { createTypeGuard as asTypeGuard }
