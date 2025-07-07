import { bindings } from '../constants'
import { Default } from '../types'
import { isRule } from './isRule'

export function isDefaultRule(rule: unknown): rule is Default {
    if (!isRule(rule)) return false
    if (!(rule[0] in bindings)) return false

    return true
}
