import { getMessage } from '../../TypeGuards/GenericTypeGuards'
import {
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    getStructMetadata,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

export function or<T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<T1 | T2> {
    const guards = [guard1, guard2] as const
    const guard = (arg: unknown): arg is T1 | T2 => guards.some(typeGuard => typeGuard(arg))

    return enpipeSchemaStructIntoGuard(
        {
            type: 'union',
            schema: guard,
            optional: false,
            types: [getStructMetadata(guard1), getStructMetadata(guard2)],
        },
        enpipeRuleMessageIntoGuard(guards.map(getMessage).join(' | '), guard)
    )
}
