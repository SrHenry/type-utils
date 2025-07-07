import type { TypeGuard } from '../../TypeGuards/types'
import type { V3 } from './types'

import { Generics } from '../../Generics'
import { branchIfOptional } from './helpers/branchIfOptional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

import { optionalize } from './helpers/optional'

function _fn(): TypeGuard<Generics.PrimitiveType> {
    const guard = (arg: unknown): arg is Generics.PrimitiveType =>
        branchIfOptional(arg, []) || (Generics.Primitives as readonly string[]).includes(typeof arg)

    return setStructMetadata(
        { type: 'primitive', schema: guard, optional: false } as V3.PrimitiveStruct,
        setRuleMessage(
            'primitive (string | number | bigint | boolean | symbol | null | undefined)',
            guard
        )
    )
}

export const primitive = optionalize(_fn)
