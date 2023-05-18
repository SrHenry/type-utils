import { getMessage, GetTypeGuards, TypeGuards } from '../../TypeGuards/GenericTypeGuards'
import {
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    getStructMetadata,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import { Merge } from '../../types'
import { V3 } from './types'

export function and<T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<Merge<T1, T2>>
export function and<TGuards extends TypeGuards<any>>(
    ...guards: TGuards
): TypeGuard<V3.TIntersection<GetTypeGuards<TGuards>>>

export function and(...guards: TypeGuard<any>[]): TypeGuard<any> {
    // const guards = [guard1, guard2] as const
    const guard = (arg: unknown): arg is any => guards.every(typeGuard => typeGuard(arg))

    return enpipeSchemaStructIntoGuard(
        {
            type: 'intersection',
            schema: guard,
            optional: false,
            types: guards.map(getStructMetadata),
        },
        enpipeRuleMessageIntoGuard(guards.map(getMessage).join(' & '), guard)
    )
}
