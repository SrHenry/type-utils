import type { Param0 } from '../../../types/Func.ts'
import type { CustomHandler } from '../types/index.ts'

import { setRule } from './setRule.ts'

export const getRuleSetterForCustomHandler = <Handler extends CustomHandler>(handler: Handler) => {
    return <Subject extends Param0<Handler>>(subject: Subject) => setRule(handler(subject))
}
