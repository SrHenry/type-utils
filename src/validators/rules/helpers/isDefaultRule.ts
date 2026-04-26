import { bindings } from '../constants.ts'
import { Default } from '../types/index.ts'
import { isRule } from './isRule.ts'

export function isDefaultRule(rule: unknown): rule is Default {
    if (!isRule(rule)) return false
    if (!(rule[0] in bindings)) return false

    return true
}
