import type { TypeGuard } from '../../TypeGuards/types'
import { type RecordRule, RecordRules } from '../rules/Record'
import type { V3 } from './types'

import { getMessage } from '../../TypeGuards/helpers/getMessage'
import { StringRules } from '../rules'
import { any } from './any'

import { branchIfOptional } from './helpers/branchIfOptional'
import { getStructMetadata } from './helpers/getStructMetadata'
import { isFollowingRules } from './helpers/isFollowingRules'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

import { optionalizeOverloadFactory } from './helpers/optional'
import { string } from './string'

const NULL = Symbol('NULL')

type Rules = {
    nonEmpty: boolean
    optional: boolean
}

const isPartialRulesObject = (arg: unknown): arg is Partial<Rules> => {
    if (typeof arg !== 'object' || arg === null || Array.isArray(arg)) return false

    if ('nonEmpty' in arg && typeof arg.nonEmpty !== 'boolean') return false
    if ('optional' in arg && typeof arg.optional !== 'boolean') return false

    return true
}

const defaults = {
    keyGuard: string([StringRules.nonEmpty()]),
    valueGuard: any(),
    rules: [] as any[],
} as const

function _fn(): TypeGuard<Record<string, any>>
function _fn(rules: Partial<Rules>): TypeGuard<Record<string, any>>
function _fn(rules: RecordRule[]): TypeGuard<Record<string, any>>

function _fn<K extends keyof any, T>(
    keyGuard: TypeGuard<K>,
    valueGuard: TypeGuard<T>
): TypeGuard<Record<K, T>>
function _fn<K extends keyof any, T>(
    keyGuard: TypeGuard<K>,
    valueGuard: TypeGuard<T>,
    rules: Partial<Rules>
): TypeGuard<Record<K, T>>
function _fn<K extends keyof any, T>(
    keyGuard: TypeGuard<K>,
    valueGuard: TypeGuard<T>,
    rules: RecordRule[]
): TypeGuard<Record<K, T>>

function _fn<K extends keyof any, T>(
    keyGuard_or_rules: TypeGuard<K> | Partial<Rules> | RecordRule[] | typeof NULL = NULL,
    valueGuard: TypeGuard<T> | typeof NULL = NULL,
    rules: Partial<Rules> | RecordRule[] | typeof NULL = NULL
): TypeGuard<Record<K, T>> | TypeGuard<Record<string, any>> {
    if (keyGuard_or_rules === NULL) return _fn(defaults.keyGuard, defaults.valueGuard)

    const handleRulesObject = (rules: Partial<Rules>) => {
        const _rules = []
        const { nonEmpty, optional } = rules

        if (nonEmpty === true) _rules.push(RecordRules.nonEmpty())
        if (optional === true) _rules.push(RecordRules.optional())

        return _fn(defaults.keyGuard, defaults.valueGuard, _rules)
    }

    if (isPartialRulesObject(keyGuard_or_rules)) return handleRulesObject(keyGuard_or_rules)

    if (Array.isArray<RecordRule>(keyGuard_or_rules)) {
        const guard = (arg: unknown): arg is Record<string, any> =>
            branchIfOptional(arg, keyGuard_or_rules) ||
            (typeof arg === 'object' && isFollowingRules(arg, keyGuard_or_rules))

        const metadata: V3.RecordStruct<string, any> = {
            type: 'record',
            schema: guard,
            keyMetadata: getStructMetadata(defaults.keyGuard) as V3.StringStruct,
            valueMetadata: getStructMetadata(defaults.valueGuard),
            rules: keyGuard_or_rules,
            optional: false,
        }

        return setStructMetadata(metadata, setRuleMessage('record', guard, keyGuard_or_rules))
    }

    if (valueGuard === NULL) ({ valueGuard } = defaults)

    if (rules === NULL) ({ rules } = defaults)

    if (isPartialRulesObject(rules)) return handleRulesObject(rules)

    const _guard = (arg: unknown): arg is Record<K, T> => {
        if (arg === null || typeof arg !== 'object') {
            return false
        }

        for (const key in arg) {
            if (!keyGuard_or_rules(key)) {
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

    const message = `record<${getMessage(keyGuard_or_rules)}, ${getMessage(valueGuard)}>`

    const metadata: V3.RecordStruct<K, T> = {
        type: 'record',
        schema: guard,
        keyMetadata: getStructMetadata(keyGuard_or_rules) as V3.GenericStruct<K>,
        valueMetadata: getStructMetadata(valueGuard) as V3.GenericStruct<T>,
        rules,
        optional: false,
    }

    return setStructMetadata<K, T>(metadata, setRuleMessage(message, guard))
}

type OptionalizedRecord = {
    (): TypeGuard<undefined | Record<string, any>>
    (rules: Partial<Rules>): TypeGuard<undefined | Record<string, any>>
    (rules: RecordRule[]): TypeGuard<undefined | Record<string, any>>

    <K extends keyof any, T>(keyGuard: TypeGuard<K>, valueGuard: TypeGuard<T>): TypeGuard<
        undefined | Record<K, T>
    >
    <K extends keyof any, T>(
        keyGuard: TypeGuard<K>,
        valueGuard: TypeGuard<T>,
        rules: Partial<Rules>
    ): TypeGuard<undefined | Record<K, T>>
    <K extends keyof any, T>(
        keyGuard: TypeGuard<K>,
        valueGuard: TypeGuard<T>,
        rules: RecordRule[]
    ): TypeGuard<undefined | Record<K, T>>
}

export const record = optionalizeOverloadFactory(_fn).optionalize<OptionalizedRecord>()
