import type { Param0 } from '../../../types/Func'
import type { CustomHandler } from '../types'

import { setRule } from './setRule'

export const getRuleSetterForCustomHandler = <Handler extends CustomHandler>(handler: Handler) => {
    return <Subject extends Param0<Handler>>(subject: Subject) => setRule(handler(subject))
}
