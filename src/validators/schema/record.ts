import { getMessage } from '../../TypeGuards/GenericTypeGuards'
import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    getStructMetadata,
    isFollowingRules,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import Rules, { StringRules } from '../rules'
import { RecordRules } from '../rules/Record'
import { any } from './any'
import { string } from './string'
import type { V3 } from './types'

const NULL = Symbol('NULL')

type Rules = {
    nonEmpty: boolean
    optional: boolean
}

const RulesObject = (arg: unknown): arg is Partial<Rules> => {
    if (typeof arg !== 'object' || arg === null || Array.isArray(arg)) return false

    if ('nonEmpty' in arg && typeof arg.nonEmpty !== 'boolean') return false
    if ('optional' in arg && typeof arg.optional !== 'boolean') return false

    return true
}

export function record(): TypeGuard<Record<string, any>>
export function record(rules: Partial<Rules>): TypeGuard<Record<string, any>>
export function record(rules: RecordRules[]): TypeGuard<Record<string, any>>

export function record<K extends keyof any, T>(
    keyGuard: TypeGuard<K>,
    valueGuard: TypeGuard<T>
): TypeGuard<Record<K, T>>
export function record<K extends keyof any, T>(
    keyGuard: TypeGuard<K>,
    valueGuard: TypeGuard<T>,
    rules: Partial<Rules>
): TypeGuard<Record<K, T>>
export function record<K extends keyof any, T>(
    keyGuard: TypeGuard<K>,
    valueGuard: TypeGuard<T>,
    rules: RecordRules[]
): TypeGuard<Record<K, T>>

export function record<K extends keyof any, T>(
    keyGuard_or_rules: TypeGuard<K> | Partial<Rules> | RecordRules[] | typeof NULL = NULL,
    valueGuard: TypeGuard<T> | typeof NULL = NULL,
    rules: Partial<Rules> | RecordRules[] | typeof NULL = NULL
): TypeGuard<Record<K, T>> | TypeGuard<Record<string, any>> {
    if (keyGuard_or_rules === NULL) return record(string([StringRules.nonEmpty()]), any())

    const handleRulesObject = (rules: Partial<Rules>) => {
        const _rules = []
        const { nonEmpty, optional } = rules

        if (nonEmpty === true) _rules.push(RecordRules.nonEmpty())
        if (optional === true) _rules.push(RecordRules.optional())

        return record(string([StringRules.nonEmpty()]), any(), _rules)
    }

    if (RulesObject(keyGuard_or_rules)) return handleRulesObject(keyGuard_or_rules)

    if (Array.isArray<RecordRules>(keyGuard_or_rules)) {
        const guard = (arg: unknown): arg is Record<string, any> =>
            branchIfOptional(arg, keyGuard_or_rules as RecordRules[]) ||
            (typeof arg === 'object' && isFollowingRules(arg, keyGuard_or_rules as RecordRules[]))

        const metadata: V3.RecordStruct<string, any> = {
            type: 'record',
            schema: guard,
            keyMetadata: getStructMetadata(string([StringRules.nonEmpty()])) as V3.StringStruct,
            valueMetadata: getStructMetadata(any()),
            optional: false,
        }

        return enpipeSchemaStructIntoGuard(
            metadata,
            enpipeRuleMessageIntoGuard('record', guard, keyGuard_or_rules)
        )
    }

    const keyGuard = keyGuard_or_rules

    if (valueGuard === NULL) {
        valueGuard = any()
    }

    if (rules === NULL) {
        rules = []
    }

    if (RulesObject(rules)) return handleRulesObject(rules)

    const _guard = (arg: unknown): arg is Record<K, T> => {
        if (arg === null || typeof arg !== 'object') {
            return false
        }

        for (const key in arg) {
            if (!keyGuard(key)) {
                return false
            }

            const value = arg[key as keyof typeof arg]

            if (!valueGuard(value)) {
                return false
            }
        }

        return true
    }

    const guard = (arg: unknown): arg is Record<K, T> =>
        branchIfOptional(arg, []) || (isFollowingRules(arg, rules) && _guard(arg))

    const message = `record<${getMessage(keyGuard)}, ${getMessage(valueGuard)}>`

    const metadata: V3.RecordStruct<K, T> = {
        type: 'record',
        schema: guard,
        keyMetadata: getStructMetadata(keyGuard) as V3.GenericStruct<K>,
        valueMetadata: getStructMetadata(valueGuard) as V3.GenericStruct<T>,
        optional: false,
    }

    return enpipeSchemaStructIntoGuard<K, T>(metadata, enpipeRuleMessageIntoGuard(message, guard))
}
