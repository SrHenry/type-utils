import type { Custom } from '../types/index.ts'

import { getMessageFormator } from '../../../TypeGuards/helpers/getMessageFormator.ts'

export const getCustomRuleMessages = (rules: Custom[]) =>
    rules.map(([, args, handler]) => `${getMessageFormator(handler(void 0))(...args)}`)
