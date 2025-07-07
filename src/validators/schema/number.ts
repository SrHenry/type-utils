import type { TypeGuard } from '../../TypeGuards/types'
import { type NumberRule, NumberRules } from '../rules/Number'

import { branchIfOptional } from './helpers/branchIfOptional'
import { isFollowingRules } from './helpers/isFollowingRules'
import { optionalizeOverloadFactory } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

type Rules = {
    min: number
    max: number
    nonZero: boolean
    optional: boolean
}

export type { Rules as NumberRulesConfig }

function _fn(): TypeGuard<number>
function _fn(rules: Partial<Rules>): TypeGuard<number>
function _fn(rules: NumberRule[]): TypeGuard<number>

function _fn(rules: Partial<Rules> | NumberRule[] = []): TypeGuard<number> {
    if (Array.isArray<NumberRule>(rules)) {
        const guard = (arg: unknown): arg is number =>
            branchIfOptional(arg, rules as NumberRule[]) ||
            (typeof arg === 'number' && isFollowingRules(arg, rules as NumberRule[]))

        return setStructMetadata(
            { type: 'number', schema: guard, optional: false },
            setRuleMessage('number', guard, rules)
        )
    }

    const { min, max, nonZero = false, optional = false } = rules

    rules = []

    if (min !== undefined) rules.push(NumberRules.min(min))
    if (max !== undefined) rules.push(NumberRules.max(max))
    if (nonZero === true) rules.push(NumberRules.nonZero())
    if (optional === true) rules.push(NumberRules.optional())

    return number(rules)
}

type OptionalizedNumber = {
    (): TypeGuard<undefined | number>
    (rules: Partial<Rules>): TypeGuard<undefined | number>
    (rules: NumberRule[]): TypeGuard<undefined | number>
}

export const number = optionalizeOverloadFactory(_fn).optionalize<OptionalizedNumber>()
