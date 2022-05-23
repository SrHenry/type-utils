import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

export function boolean(): TypeGuard<boolean> {
    const guard = (arg: unknown): arg is boolean =>
        branchIfOptional(arg, []) || typeof arg === 'boolean'

    return enpipeSchemaStructIntoGuard(
        { type: 'boolean', schema: guard, optional: false },
        enpipeRuleMessageIntoGuard('boolean', guard)
    )
}
