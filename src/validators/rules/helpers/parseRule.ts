import { bindings } from '../constants.ts'
import { RuleTuple } from '../types/RuleTuple.ts'
import { getRule } from './getRule.ts'

export function parseRule<R extends RuleTuple>([rule]: R): bindings[typeof rule]
export function parseRule([rule]: RuleTuple): bindings[keyof bindings] {
    return getRule(rule)
}
