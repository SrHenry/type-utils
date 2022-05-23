import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

export function asUndefined(): TypeGuard<undefined> {
    const guard = (arg: unknown): arg is undefined => branchIfOptional(arg, []) || arg === void 0

    return enpipeSchemaStructIntoGuard(
        { type: 'undefined', schema: guard, optional: false },
        enpipeRuleMessageIntoGuard('undefined', guard)
    )
}
