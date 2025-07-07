import type { TypeGuard } from '../../TypeGuards/types'

import { branchIfOptional } from './helpers/branchIfOptional'
import { optionalize } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

function _fn(): TypeGuard<null> {
    const guard = (arg: unknown): arg is null => branchIfOptional(arg, []) || arg === null

    return setStructMetadata(
        { type: 'null', schema: guard, optional: false },
        setRuleMessage('null', guard)
    )
}

export const asNull = optionalize(_fn)
