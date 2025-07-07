import type { All as AllRules, RuleTuple } from '../../rules/types'

import { keys } from '../../../validators/rules/constants'

export const isOptional = (rule: AllRules): rule is RuleTuple<'optional'> =>
    rule[0] in keys && rule[0] === keys.optional
