import type { All as AllRules, RuleTuple } from '../../rules/types/index.ts'

import { isOptional } from './isOptional.ts'

export const isRequired = (rule: AllRules): rule is Exclude<AllRules, RuleTuple<'optional'>> =>
    !isOptional(rule)
