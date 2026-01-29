import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { BigIntSchema } from './types/BigIntSchema'

import { useCustomRules } from '../rules/helpers/useCustomRules'
import { type NumberRule, NumberRules } from '../rules/Number'
import { SchemaValidator } from '../SchemaValidator'
import { branchIfOptional } from './helpers/branchIfOptional'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata'
import { isFollowingRules } from './helpers/isFollowingRules'
import { optionalizeOverloadFactory } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'
import { validateCustomRules } from './helpers/validateCustomRules'

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

    return _fn(rules)
}

type OptionalizedBigInt = {
    (): TypeGuard<undefined | bigint>
    (rules: Partial<Rules>): TypeGuard<undefined | bigint>
    (rules: NumberRule[]): TypeGuard<undefined | bigint>
}

export const _bigint = optionalizeOverloadFactory(_fn).optionalize<OptionalizedBigInt>()

export const bigint: BigIntSchema = (() => {
    const rules: NumberRule[] = []
    const customRules: Custom<any[], string, bigint>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _bigint.optional : _bigint
        return resolver(rules)
    }

    const schema = (arg: unknown) => {
        const guard = getGuard()

        if (customRules.length > 0) {
            return useCustomRules(guard, ...customRules)(arg)
        }

        return guard(arg)
    }

    const addCall = (
        fnName: string,
        _rules: unknown[] = [],
        { throwOnError = true }: Record<string, any> = {}
    ) => {
        if (callStack[fnName]) throw new Error(`Cannot call ${fnName} more than once`)

        if (fnName === 'validator') {
            const validator = (arg: unknown) =>
                SchemaValidator.validate(arg, schema as unknown as TypeGuard<any>, throwOnError)

            Object.assign(validator, {
                validate: validator,
            })

            return copyStructMetadata(getGuard(), validator, {
                rules: customRules.map(getRuleStructMetadata<Custom<any[], string, bigint>>),
            })
        }

        if (fnName === 'use') {
            validateCustomRules(_rules)
            customRules.push(...(_rules as Custom<any[], string, bigint>[]))
        } else {
            callStack[fnName] = true

            if (fnName !== 'optional') rules.push(...(_rules as NumberRule[]))
        }

        return copyStructMetadata(getGuard(), schema, {
            rules: customRules.map(getRuleStructMetadata<Custom<any[], string, bigint>>),
        })
    }

    schema.optional = () => addCall('optional')
    schema.nonZero = () => addCall('nonZero', [NumberRules.nonZero()])
    schema.max = (n: bigint) => addCall('max', [NumberRules.max(n)])
    schema.min = (n: bigint) => addCall('min', [NumberRules.min(n)])
    schema.validator = (throwOnError = true) => addCall('validator', [], { throwOnError })
    schema.use = (...rules: Custom<any[], string, bigint>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema, {
        rules: customRules.map(getRuleStructMetadata<Custom<any[], string, bigint>>),
    })
}) as unknown as BigIntSchema
