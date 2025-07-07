import { bindings } from '../constants'
import { RuleTuple } from '../types/RuleTuple'
import { getRule } from './getRule'

export function parseRule<R extends RuleTuple>([rule]: R): bindings[typeof rule]
export function parseRule([rule]: RuleTuple): bindings[keyof bindings] {
    return getRule(rule)
}
