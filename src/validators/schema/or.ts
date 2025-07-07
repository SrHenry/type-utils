import type { GetTypeGuards, TypeGuard, TypeGuards } from '../../TypeGuards/types'
import type { V3 } from './types'

import { getMessage } from '../../TypeGuards/helpers/getMessage'
import { getStructMetadata } from './helpers/getStructMetadata'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

import { optionalizeOverloadFactory } from './helpers/optional'

function _fn<T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<T1 | T2>
function _fn<TGuards extends TypeGuards<any>>(
    ...guards: TGuards
): TypeGuard<V3.TUnion<GetTypeGuards<TGuards>>>

function _fn(...guards: TypeGuards<any>): TypeGuard<any> {
    const guard = (arg: unknown): arg is any => guards.some(typeGuard => typeGuard(arg))

    return setStructMetadata(
        {
            type: 'union',
            schema: guard,
            optional: false,
            types: guards.map(getStructMetadata),
        },
        setRuleMessage(guards.map(getMessage).join(' | '), guard)
    )
}

type OptionalizedOr = {
    <T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<T1 | T2>
    <TGuards extends TypeGuards<any>>(...guards: TGuards): TypeGuard<
        V3.TUnion<GetTypeGuards<TGuards>>
    >
}

export const or = optionalizeOverloadFactory(_fn).optionalize<OptionalizedOr>()
