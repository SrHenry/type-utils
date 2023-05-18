import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

export function asNull(): TypeGuard<null> {
    const guard = (arg: unknown): arg is null => branchIfOptional(arg, []) || arg === null

    return enpipeSchemaStructIntoGuard(
        { type: 'null', schema: guard, optional: false },
        enpipeRuleMessageIntoGuard('null', guard)
    )
}
