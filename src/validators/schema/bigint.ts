import { NumberRules } from '../rules/Number'
import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    isFollowingRules,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

type Rules = {
    min: bigint
    max: bigint
    nonZero: boolean
    optional: boolean
}
export type { Rules as BigIntRulesConfig }

export function bigint(): TypeGuard<bigint>
export function bigint(rules: Partial<Rules>): TypeGuard<bigint>
export function bigint(rules: NumberRules[]): TypeGuard<bigint>
export function bigint(rules: Partial<Rules> | NumberRules[] = []): TypeGuard<bigint> {
    if (Array.isArray<NumberRules>(rules)) {
        const guard = (arg: unknown): arg is bigint =>
            branchIfOptional(arg, rules as NumberRules[]) ||
            (typeof arg === 'bigint' && isFollowingRules(arg, rules as NumberRules[]))

        return enpipeSchemaStructIntoGuard(
            { type: 'bigint', schema: guard, optional: false },
            enpipeRuleMessageIntoGuard('bigint', guard, rules)
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
