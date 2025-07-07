import type { Rule } from '../types'

import { is } from '../../../TypeGuards/helpers'
import { bindings, keys } from '../constants'

export function getRule<T extends keyof keys>(name: T): bindings[keys[T]]
export function getRule<T extends keyof keys, R extends Rule>(name: T): R

export function getRule<T extends keyof bindings>(key: T): bindings[T]
export function getRule<T extends keyof bindings, R extends Rule>(key: T): R

export function getRule<T extends keyof keys | keyof bindings>(
    name: T
): bindings[keys[keyof keys]] | bindings[keyof bindings] {
    const isRuleName = (str: unknown): str is keyof keys => typeof str === 'string' && str in keys

    const isKeyName = (str: unknown): str is keyof bindings =>
        typeof str === 'string' && str in bindings

    if (is(name, isRuleName)) return bindings[keys[name]]
    else if (is(name, isKeyName)) return bindings[name]

    throw new Error(`Rule not found`)
}
