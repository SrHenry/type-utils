import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { NumberSchema } from './types/NumberSchema'

import { type NumberRule, NumberRules } from '../rules/Number'
import { useCustomRules } from '../rules/helpers/useCustomRules'
import { branchIfOptional } from './helpers/branchIfOptional'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata'
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
            {
                type: 'number',
                schema: guard,
                optional: false,
                rules: rules.map(getRuleStructMetadata<NumberRule>),
            },
            setRuleMessage('number', guard, rules)
        )
    }

    const { min, max, nonZero = false, optional = false } = rules

    rules = []

    if (min !== undefined) rules.push(NumberRules.min(min))
    if (max !== undefined) rules.push(NumberRules.max(max))
    if (nonZero === true) rules.push(NumberRules.nonZero())
    if (optional === true) rules.push(NumberRules.optional())

    return _fn(rules)
}

type OptionalizedNumber = {
    (): TypeGuard<undefined | number>
    (rules: Partial<Rules>): TypeGuard<undefined | number>
    (rules: NumberRule[]): TypeGuard<undefined | number>
}

export const _number = optionalizeOverloadFactory(_fn).optionalize<OptionalizedNumber>()

export const number: NumberSchema = (() => {
    const rules: NumberRule[] = []
    const customRules: Custom<any[], string, string>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _number.optional : _number
        return resolver(rules)
    }

    const schema = (arg: unknown) => {
        const guard = getGuard()

        if (customRules.length > 0) {
            return useCustomRules(guard, ...customRules)(arg)
        }

        return guard(arg)
    }

    const addCall = (fnName: string, _rules: unknown[] = []) => {
        if (callStack[fnName]) throw new Error(`Cannot call ${fnName} more than once`)

        if (fnName === 'use') {
            customRules.push(...(_rules as Custom<any[], string, string>[]))
        } else {
            callStack[fnName] = true

            if (fnName !== 'optional') rules.push(...(_rules as NumberRule[]))
        }

        return copyStructMetadata(getGuard(), schema)
    }

    schema.optional = () => addCall('optional')
    schema.nonZero = () => addCall('nonZero', [NumberRules.nonZero()])
    schema.max = (n: number) => addCall('max', [NumberRules.max(n)])
    schema.min = (n: number) => addCall('min', [NumberRules.min(n)])
    schema.use = (...rules: Custom<any[], string, string>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema)
}) as unknown as NumberSchema
