import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { StringSchema } from './types/StringSchema'

import { setMessage } from '../../TypeGuards/helpers/setMessage'
import { template as ruleTemplate } from '../rules/common'
import { useCustomRules } from '../rules/helpers/useCustomRules'
import { type StringRule, StringRules } from '../rules/String'
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
                // rules: [StringRules.regex(RegExp(`^${rules}$`, 'g'))].map(
                //     getRuleStructMetadata<StringRule>
                // ),
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

export const _string = optionalizeOverloadFactory(_fn).optionalize<OptionalizedString>()

export const string = ((matcher?: string | RegExp) => {
    const rules: StringRule[] = []
    const customRules: Custom<any[], string, string>[] = []

    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _string.optional : _string
        let guard = resolver(rules)
        {
            // override guard with matcher
            if (matcher) {
                if (typeof matcher === 'string') {
                    guard = resolver(matcher)
                }
                if (matcher instanceof RegExp) {
                    guard = resolver(matcher)
                }
            }
        }

        return guard
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
                rules: customRules.map(getRuleStructMetadata<Custom<any[], string, string>>),
            })
        }

        if (fnName === 'use') {
            validateCustomRules(_rules)
            customRules.push(...(_rules as Custom<any[], string, string>[]))
        } else {
            callStack[fnName] = true

            if (fnName !== 'optional') rules.push(...(_rules as StringRule[]))
        }

        return copyStructMetadata(getGuard(), schema, {
            rules: customRules.map(getRuleStructMetadata<Custom<any[], string, string>>),
        })
    }

    schema.optional = () => addCall('optional')
    schema.min = (n: number) => addCall('min', [StringRules.min(n)])
    schema.max = (n: number) => addCall('max', [StringRules.max(n)])
    schema.regex = (regex: RegExp) => addCall('regex', [StringRules.regex(regex)])

    schema.nonEmpty = () => addCall('nonEmpty', [StringRules.nonEmpty()])
    schema.url = () => addCall('url', [StringRules.url()])
    schema.email = () => addCall('email', [StringRules.email()])
    schema.validator = (throwOnError = true) => addCall('validator', [], { throwOnError })
    schema.use = (...rules: Custom<any[], string, string>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema, {
        rules: customRules.map(getRuleStructMetadata<Custom<any[], string, string>>),
    })
}) as unknown as StringSchema
