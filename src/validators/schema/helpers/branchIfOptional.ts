import type { All as AllRules } from '../../rules/types/index.ts'

import { getRule } from '../../rules/helpers/getRule.ts'
import { isOptional } from './isOptional.ts'

export const branchIfOptional = (arg: unknown, rules: AllRules[]) => {
    const optionalRule = rules.find(isOptional)
    if (!optionalRule) return false

    return getRule(optionalRule[0]).call(null, arg)
}
