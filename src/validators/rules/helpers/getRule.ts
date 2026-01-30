import type { Rule } from '../types'

import { bindings, keys } from '../constants'

import { isKeyName } from './isKeyName'
import { isRuleName } from './isRuleName'

export function getRule<T extends keyof keys>(name: T): bindings[keys[T]]
export function getRule<T extends keyof keys, R extends Rule>(name: T): R

export function getRule<T extends keyof bindings>(key: T): bindings[T]
export function getRule<T extends keyof bindings, R extends Rule>(key: T): R

export function getRule<T extends keyof keys | keyof bindings>(
    name: T
): bindings[keys[keyof keys]] | bindings[keyof bindings] {
    if (isRuleName(name)) return bindings[keys[name]]
    if (isKeyName(name)) return bindings[name]

    throw new TypeError(`Rule '${name}' not found`)
}
