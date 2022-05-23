import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    exact,
    exactFormator,
    isFollowingRules,
    _hasOptionalProp,
} from './helpers'
import { setMessage } from '../../TypeGuards/GenericTypeGuards'
import { StringRules as StringRules } from '../rules/String'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

export function string(): TypeGuard<string>
export function string(rules: StringRules[]): TypeGuard<string>
export function string<T extends string>(matches: T): TypeGuard<T>
export function string(regex: RegExp): TypeGuard<string>

export function string(rules: StringRules[] | string | RegExp = []): TypeGuard<string> {
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

    const guard = (arg: unknown): arg is string =>
        branchIfOptional(arg, rules) || (typeof arg === 'string' && isFollowingRules(arg, rules))

    return enpipeSchemaStructIntoGuard(
        { type: 'string', schema: guard, optional: false },
        enpipeRuleMessageIntoGuard('string', guard, rules)
    ) //TODO: Checkpoint
}
