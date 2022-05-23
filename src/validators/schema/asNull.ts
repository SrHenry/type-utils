import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import { NullStruct } from './types'

export function asNull(): TypeGuard<null> {
    const guard = (arg: unknown): arg is null => branchIfOptional(arg, []) || arg === null

    return enpipeSchemaStructIntoGuard<NullStruct, null>(
        { type: 'null', schema: guard, optional: false },
        enpipeRuleMessageIntoGuard('null', guard)
    )
}
