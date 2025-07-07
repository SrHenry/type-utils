import type { TypeGuard } from '../../TypeGuards/types'

import { branchIfOptional } from './helpers/branchIfOptional'
import { optionalize } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

function _fn(): TypeGuard<boolean> {
    const guard = (arg: unknown): arg is boolean =>
        branchIfOptional(arg, []) || typeof arg === 'boolean'

    return setStructMetadata(
        { type: 'boolean', schema: guard, optional: false },
        setRuleMessage('boolean', guard)
    )
}

export const boolean = optionalize(_fn)
