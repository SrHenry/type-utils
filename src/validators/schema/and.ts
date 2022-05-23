import {
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    getStructMetadata,
} from './helpers'
import { getMessage } from '../../TypeGuards/GenericTypeGuards'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

import type { Generics } from '../../Generics'

export function and<T1 extends Generics.PrimitiveType, T2 extends Generics.PrimitiveType>(
    guard1: TypeGuard<T1>,
    guard2: TypeGuard<T2>
): TypeGuard<T1 & T2> {
    const guards = [guard1, guard2] as const
    const guard = (arg: unknown): arg is T1 & T2 => guards.every(typeGuard => typeGuard(arg))

    return enpipeSchemaStructIntoGuard(
        {
            type: 'intersection',
            schema: guard,
            optional: false,
            types: [getStructMetadata(guard1), getStructMetadata(guard2)],
        },
        enpipeRuleMessageIntoGuard(`${guards.map(getMessage).join(' & ')}`, guard)
    )
}
