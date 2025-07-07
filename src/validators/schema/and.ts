import type { GetTypeGuards, TypeGuard, TypeGuards } from '../../TypeGuards/types'
import type { Merge } from '../../types'
import type { V3 } from './types'

import { getMessage } from '../../TypeGuards/helpers/getMessage'
import { getStructMetadata } from './helpers/getStructMetadata'
import { optionalizeOverloadFactory } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

function _fn<T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<Merge<T1, T2>>
function _fn<TGuards extends TypeGuards<any>>(
    ...guards: TGuards
): TypeGuard<V3.TIntersection<GetTypeGuards<TGuards>>>

function _fn(...guards: TypeGuard<any>[]): TypeGuard<any> {
    // const guards = [guard1, guard2] as const
    const guard = (arg: unknown): arg is any => guards.every(typeGuard => typeGuard(arg))

    return setStructMetadata(
        {
            type: 'intersection',
            schema: guard,
            optional: false,
            types: guards.map(getStructMetadata),
        },
        setRuleMessage(guards.map(getMessage).join(' & '), guard)
    )
}

type OptionalizedAnd = {
    <T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<undefined | Merge<T1, T2>>
    <TGuards extends TypeGuards<any>>(...guards: TGuards): TypeGuard<
        undefined | V3.TIntersection<GetTypeGuards<TGuards>>
    >
}

// export const and = optionalize(_fn)
export const and = optionalizeOverloadFactory(_fn).optionalize<OptionalizedAnd>()
