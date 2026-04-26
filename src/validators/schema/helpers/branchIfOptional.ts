import { All as AllRules } from '../../rules/types/index.ts'

import { getRule } from '../../rules/helpers/getRule.ts'
import { isOptional } from './isOptional.ts'

export const branchIfOptional = (arg: unknown, rules: AllRules[]) =>
    rules.some(isOptional) ? getRule(rules.find(isOptional)![0]).call(null, arg) : false
