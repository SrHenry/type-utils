import { setMessage } from '../../TypeGuards/GenericTypeGuards'
import { StringRules } from '../rules/String'
import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    exact,
    exactFormator,
    isFollowingRules,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

type Rules = {
    min: number | bigint
    max: number | bigint
    regex: RegExp
    nonEmpty: boolean
    optional: boolean
}

export type { Rules as StringRulesConfig }

export function string(): TypeGuard<string>
export function string(rules: Partial<Rules>): TypeGuard<string>
export function string(rules: StringRules[]): TypeGuard<string>
export function string<T extends string>(matches: T): TypeGuard<T>
export function string(regex: RegExp): TypeGuard<string>

export function string(
    rules: Partial<Rules> | StringRules[] | string | RegExp = []
): TypeGuard<string> {
    if (typeof rules === 'string') {
        const guard = (arg: unknown): arg is string =>
            typeof arg === 'string' && isFollowingRules(arg, [exact(rules)])

        return enpipeSchemaStructIntoGuard(
            { type: 'string', schema: guard, optional: false },
            setMessage(`string & ${exactFormator(rules)}`, guard)
        )
    }

    if (rules instanceof RegExp) {
        const rules_arr = [StringRules.regex(rules)]
        const guard = (arg: unknown): arg is string =>
            typeof arg === 'string' && isFollowingRules(arg, rules_arr)

        return enpipeSchemaStructIntoGuard(
            { type: 'string', schema: guard, optional: false },
            enpipeRuleMessageIntoGuard('string', guard, rules_arr)
        )
    }

    if (Array.isArray<StringRules>(rules)) {
        const guard = (arg: unknown): arg is string =>
            branchIfOptional(arg, rules as StringRules[]) ||
            (typeof arg === 'string' && isFollowingRules(arg, rules as StringRules[]))

        return enpipeSchemaStructIntoGuard(
            { type: 'string', schema: guard, optional: false },
            enpipeRuleMessageIntoGuard('string', guard, rules)
        )
    }

    const { min, max, regex, nonEmpty = false, optional = false } = rules

    rules = []

    if (min !== undefined) rules.push(StringRules.min(min))
    if (max !== undefined) rules.push(StringRules.max(max))
    if (regex !== undefined) rules.push(StringRules.regex(regex))
    if (nonEmpty === true) rules.push(StringRules.nonEmpty())
    if (optional === true) rules.push(StringRules.optional())

    return string(rules)
}
