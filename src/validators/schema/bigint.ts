import { NumberRules } from '../rules/Number'
import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    isFollowingRules,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

export function bigint(rules: NumberRules[] = []): TypeGuard<bigint> {
    const guard = (arg: unknown): arg is bigint =>
        branchIfOptional(arg, rules) || (typeof arg === 'bigint' && isFollowingRules(arg, rules))

    return enpipeSchemaStructIntoGuard(
        { type: 'bigint', schema: guard, optional: false },
        enpipeRuleMessageIntoGuard('bigint', guard, rules)
    )
}
