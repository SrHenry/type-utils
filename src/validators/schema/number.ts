import { NumberRules } from '../rules/Number'
import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    isFollowingRules,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

type Rules = {
    min: number
    max: number
    nonZero: boolean
    optional: boolean
}

export type { Rules as NumberRulesConfig }

export function number(): TypeGuard<number>
export function number(rules: Partial<Rules>): TypeGuard<number>
export function number(rules: NumberRules[]): TypeGuard<number>
export function number(rules: Partial<Rules> | NumberRules[] = []): TypeGuard<number> {
    if (Array.isArray<NumberRules>(rules)) {
        const guard = (arg: unknown): arg is number =>
            branchIfOptional(arg, rules as NumberRules[]) ||
            (typeof arg === 'number' && isFollowingRules(arg, rules as NumberRules[]))

        return enpipeSchemaStructIntoGuard(
            { type: 'number', schema: guard, optional: false },
            enpipeRuleMessageIntoGuard('number', guard, rules)
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
