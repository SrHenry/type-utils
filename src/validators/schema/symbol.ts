import type { TypeGuard } from '../../TypeGuards/types'

import { branchIfOptional } from './helpers/branchIfOptional'
import { optionalizeOverloadFactory } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

// TODO: Add overload for optional symbol instance to compare against
function _fn(): TypeGuard<symbol>

function _fn(): TypeGuard<symbol> {
    const guard = (arg: unknown): arg is symbol =>
        branchIfOptional(arg, []) || typeof arg === 'symbol'

    return setStructMetadata(
        { type: 'symbol', schema: guard, optional: false },
        setRuleMessage('symbol', guard)
    )
}

type OptionalizedSymbol = {
    (): TypeGuard<undefined | symbol>
}

export const symbol = optionalizeOverloadFactory(_fn).optionalize<OptionalizedSymbol>()
