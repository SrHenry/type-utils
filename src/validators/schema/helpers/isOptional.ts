import type { All as AllRules, RuleTuple } from '../../rules/types/index.ts'

import { keys } from '../../../validators/rules/constants.ts'

export const isOptional = (rule: AllRules): rule is RuleTuple<'optional'> =>
    rule[0] in keys && rule[0] === keys.optional
