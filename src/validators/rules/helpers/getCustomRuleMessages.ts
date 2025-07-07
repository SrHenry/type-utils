import type { Custom } from '../types'

import { getMessageFormator } from '../../../TypeGuards/helpers/getMessageFormator'

export const getCustomRuleMessages = (rules: Custom[]) =>
    rules.map(([, args, handler]) => `${getMessageFormator(handler(void 0))(...args)}`)
