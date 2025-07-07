import type { TypeGuard } from '../../TypeGuards/types'

import { branchIfOptional } from './helpers/branchIfOptional'
import { optionalize } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

function _fn(): TypeGuard<undefined> {
    const guard = (arg: unknown): arg is undefined => branchIfOptional(arg, []) || arg === void 0

    return setStructMetadata(
        { type: 'undefined', schema: guard, optional: false },
        setRuleMessage('undefined', guard)
    )
}

export const asUndefined = optionalize(_fn)
