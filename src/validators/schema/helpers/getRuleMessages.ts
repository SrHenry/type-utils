import type { Default as DefaultRules } from '../../rules/types'

import { getMessageFormator } from '../../../TypeGuards/helpers/getMessageFormator'
import { getRule } from '../../rules/helpers/getRule'

export const getRuleMessages = (rules: DefaultRules[]) =>
    rules
        .map(([rule, args]) => ({ rule: getRule(rule), args }))
        .map(({ rule, args }) => `${getMessageFormator(rule)(...args)}`)
