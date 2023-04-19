import { getMessage } from '../../TypeGuards/GenericTypeGuards'
import {
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    getStructMetadata,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import { Merge } from '../../types'

export function and<T1, T2>(
    guard1: TypeGuard<T1>,
    guard2: TypeGuard<T2>
): TypeGuard<Merge<T1, T2>> {
    const guards = [guard1, guard2] as const
    const guard = (arg: unknown): arg is Merge<T1, T2> => guards.every(typeGuard => typeGuard(arg))

    return enpipeSchemaStructIntoGuard(
        {
            type: 'intersection',
            schema: guard,
            optional: false,
            types: [getStructMetadata(guard1), getStructMetadata(guard2)],
        },
        enpipeRuleMessageIntoGuard(guards.map(getMessage).join(' & '), guard)
    )
}
