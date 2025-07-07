import type { All as AllRules, RuleTuple } from '../../rules/types'

import { isOptional } from './isOptional'

export const isRequired = (rule: AllRules): rule is Exclude<AllRules, RuleTuple<'optional'>> =>
    !isOptional(rule)
