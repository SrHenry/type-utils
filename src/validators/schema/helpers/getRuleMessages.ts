import type { Custom as CustomRules, Default as DefaultRules } from '../../rules/types/index.ts'

import { getMessageFormator } from '../../../TypeGuards/helpers/getMessageFormator.ts'
import { mapDefaultOrCustomRules } from './mappers/mapDefaultOrCustomRules.ts'

export const getRuleMessages = (rules: Array<DefaultRules | CustomRules>) =>
    rules
        .map(mapDefaultOrCustomRules)
        .map(({ rule, args }) => `${getMessageFormator(rule)(...args)}`)
