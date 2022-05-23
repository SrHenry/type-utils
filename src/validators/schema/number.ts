import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    isFollowingRules,
    _hasOptionalProp,
} from './helpers'
import { NumberRules as NumberRules } from '../rules/Number'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

export function number(rules: NumberRules[] = []): TypeGuard<number> {
    const guard = (arg: unknown): arg is number =>
        branchIfOptional(arg, rules) || (typeof arg === 'number' && isFollowingRules(arg, rules))

    return enpipeSchemaStructIntoGuard(
        { type: 'number', schema: guard, optional: false },
        enpipeRuleMessageIntoGuard('number', guard, rules)
    )
}
