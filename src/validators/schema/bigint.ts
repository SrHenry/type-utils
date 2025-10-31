import type { TypeGuard } from '../../TypeGuards/types'

import { type NumberRule, NumberRules } from '../rules/Number'
import { branchIfOptional } from './helpers/branchIfOptional'
import { isFollowingRules } from './helpers/isFollowingRules'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

import { getRuleStructMetadata } from './helpers/getRuleStructMetadata'
import { optionalizeOverloadFactory } from './helpers/optional'

type Rules = {
    min: bigint
    max: bigint
    nonZero: boolean
    optional: boolean
}
export type { Rules as BigIntRulesConfig }

function _fn(): TypeGuard<bigint>
function _fn(rules: Partial<Rules>): TypeGuard<bigint>
function _fn(rules: NumberRule[]): TypeGuard<bigint>

function _fn(rules: Partial<Rules> | NumberRule[] = []): TypeGuard<bigint> {
    if (Array.isArray<NumberRule>(rules)) {
        const guard = (arg: unknown): arg is bigint =>
            branchIfOptional(arg, rules as NumberRule[]) ||
            (typeof arg === 'bigint' && isFollowingRules(arg, rules as NumberRule[]))

        return setStructMetadata(
            {
                type: 'bigint',
                schema: guard,
                optional: false,
                rules: rules.map(getRuleStructMetadata<NumberRule>),
            },
            setRuleMessage('bigint', guard, rules)
        )
    }

    const { min, max, nonZero = false, optional = false } = rules

    rules = []

    if (min !== undefined) rules.push(NumberRules.min(min))
    if (max !== undefined) rules.push(NumberRules.max(max))
    if (nonZero === true) rules.push(NumberRules.nonZero())
    if (optional === true) rules.push(NumberRules.optional())

    return bigint(rules)
}

type OptionalizedBigInt = {
    (): TypeGuard<undefined | bigint>
    (rules: Partial<Rules>): TypeGuard<undefined | bigint>
    (rules: NumberRule[]): TypeGuard<undefined | bigint>
}

export const bigint = optionalizeOverloadFactory(_fn).optionalize<OptionalizedBigInt>()
