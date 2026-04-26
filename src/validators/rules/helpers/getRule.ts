import type { Rule } from '../types/index.ts'

import { bindings, keys } from '../constants.ts'

import { isKeyName } from './isKeyName.ts'
import { isRuleName } from './isRuleName.ts'

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
