import type { Custom as CustomRules, Default as DefaultRules } from '../../rules/types'

import { getMessageFormator } from '../../../TypeGuards/helpers/getMessageFormator'
import { mapDefaultOrCustomRules } from './mappers/mapDefaultOrCustomRules'

export const getRuleMessages = (rules: Array<DefaultRules | CustomRules>) =>
    rules
        .map(mapDefaultOrCustomRules)
        .map(({ rule, args }) => `${getMessageFormator(rule)(...args)}`)
