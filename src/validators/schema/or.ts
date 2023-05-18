import { getMessage, GetTypeGuards, TypeGuards } from '../../TypeGuards/GenericTypeGuards'
import {
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    getStructMetadata,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import { V3 } from './types'

export function or<T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<T1 | T2>
export function or<TGuards extends TypeGuards<any>>(
    ...guards: TGuards
): TypeGuard<V3.TUnion<GetTypeGuards<TGuards>>>

export function or(...guards: TypeGuards<any>): TypeGuard<any> {
    const guard = (arg: unknown): arg is any => guards.some(typeGuard => typeGuard(arg))

    return enpipeSchemaStructIntoGuard(
        {
            type: 'union',
            schema: guard,
            optional: false,
            types: guards.map(getStructMetadata),
        },
        enpipeRuleMessageIntoGuard(guards.map(getMessage).join(' | '), guard)
    )
}
