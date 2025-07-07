import { All as AllRules } from '../../rules/types'

import { getRule } from '../../rules/helpers/getRule'
import { isOptional } from './isOptional'

export const branchIfOptional = (arg: unknown, rules: AllRules[]) =>
    rules.some(isOptional) ? getRule(rules.find(isOptional)![0]).call(null, arg) : false
