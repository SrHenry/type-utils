import type { TypeGuard } from '../../TypeGuards/types'

import { setMessage } from '../../TypeGuards/helpers/setMessage'
import { template as ruleTemplate } from '../rules/common'
import { type StringRule, StringRules } from '../rules/String'

import { branchIfOptional } from './helpers/branchIfOptional'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata'
import { isFollowingRules } from './helpers/isFollowingRules'
import { optionalizeOverloadFactory } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

type Rules = {
    min: number | bigint
    max: number | bigint
    regex: RegExp
    nonEmpty: boolean
    optional: boolean
}

export type { Rules as StringRulesConfig }

const exactFormator = <StringLiteral extends string>(to: StringLiteral) =>
    ruleTemplate(`exact '${to}'`)

function _fn(): TypeGuard<string>
function _fn(rules: Partial<Rules>): TypeGuard<string>
function _fn(rules: StringRule[]): TypeGuard<string>
function _fn<T extends string>(matches: T): TypeGuard<T>
function _fn(regex: RegExp): TypeGuard<string>

function _fn(rules: Partial<Rules> | StringRule[] | string | RegExp = []): TypeGuard<string> {
    if (typeof rules === 'string') {
        const guard = (arg: unknown): arg is string =>
            // typeof arg === 'string' && isFollowingRules<ExactRule<string>>(arg, [exact(rules as string)])
            // typeof arg === 'string' && useCustomRules(guard, exact(rules))
            // typeof arg === 'string' && isExactString(arg, rules)
            typeof arg === 'string' && arg === rules

        return setStructMetadata(
            {
                type: 'string',
                schema: guard,
                optional: false,
                rules: [],
            },
            setMessage(`string & ${exactFormator(rules)}`, guard)
        )
    }

    if (rules instanceof RegExp) {
        const rules_arr = [StringRules.regex(rules)]
        const guard = (arg: unknown): arg is string =>
            typeof arg === 'string' && isFollowingRules(arg, rules_arr)

        return setStructMetadata(
            {
                type: 'string',
                schema: guard,
                optional: false,
                rules: rules_arr.map(getRuleStructMetadata<StringRule>),
            },
            setRuleMessage('string', guard, rules_arr)
        )
    }

    if (Array.isArray<StringRule>(rules)) {
        const guard = (arg: unknown): arg is string =>
            branchIfOptional(arg, rules as StringRule[]) ||
            (typeof arg === 'string' && isFollowingRules(arg, rules as StringRule[]))

        return setStructMetadata(
            {
                type: 'string',
                schema: guard,
                optional: false,
                rules: rules.map(getRuleStructMetadata<StringRule>),
            },
            setRuleMessage('string', guard, rules)
        )
    }

    const { min, max, regex, nonEmpty = false, optional = false } = rules

    rules = []

    if (min !== undefined) rules.push(StringRules.min(min))
    if (max !== undefined) rules.push(StringRules.max(max))
    if (regex !== undefined) rules.push(StringRules.regex(regex))
    if (nonEmpty === true) rules.push(StringRules.nonEmpty())
    if (optional === true) rules.push(StringRules.optional())

    return _fn(rules)
}

type OptionalizedString = {
    (): TypeGuard<string>
    (rules: Partial<Rules>): TypeGuard<string>
    (rules: StringRule[]): TypeGuard<string>
    <T extends string>(matches: T): TypeGuard<T>
    (regex: RegExp): TypeGuard<string>
}

export const string = optionalizeOverloadFactory(_fn).optionalize<OptionalizedString>()
