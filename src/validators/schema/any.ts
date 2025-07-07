import type { TypeGuard } from '../../TypeGuards/types'

import { optionalize } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

function _fn(): TypeGuard<any> {
    const guard = (_: unknown): _ is any => true

    return setStructMetadata(
        { type: 'any', schema: guard, optional: false },
        setRuleMessage('any', guard)
    )
}

export const any = optionalize(_fn)
