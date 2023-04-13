import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'
//TODO: Add overload for optional symbol instance to compare against
export function symbol(): TypeGuard<symbol> {
    const guard = (arg: unknown): arg is symbol =>
        branchIfOptional(arg, []) || typeof arg === 'symbol'

    return enpipeSchemaStructIntoGuard(
        { type: 'symbol', schema: guard, optional: false },
        enpipeRuleMessageIntoGuard('symbol', guard)
    )
}
