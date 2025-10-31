import type { TypeGuard } from '../../TypeGuards/types'
import type { ArrayRule } from '../rules/Array'
import type { ValidatorMap } from '../types'
import type { V3 } from './types'

import { getMessage } from '../../TypeGuards/helpers/getMessage'
import { any } from './any'

import { branchIfOptional } from './helpers/branchIfOptional'
import { getStructMetadata } from './helpers/getStructMetadata'
import { isFollowingRules } from './helpers/isFollowingRules'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

import { getRuleStructMetadata } from './helpers/getRuleStructMetadata'
import { optionalizeOverloadFactory } from './helpers/optional'
import { object } from './object'

function _fn(): TypeGuard<any[]>
function _fn(rules: ArrayRule[]): TypeGuard<any[]>
function _fn<T>(rules: ArrayRule[], schema: TypeGuard<T>): TypeGuard<T[]>
function _fn<T>(schema: TypeGuard<T>): TypeGuard<T[]>
function _fn(tree: {}): TypeGuard<{}[]>
function _fn<T>(tree: ValidatorMap<T>): TypeGuard<T[]>
function _fn<T>(
    rules?: ArrayRule[] | TypeGuard<T> | null | undefined,
    schema?: TypeGuard<T>
): TypeGuard<T[]>

function _fn<T>(
    this: unknown,
    rules: ArrayRule[] | TypeGuard<T> | null | undefined | ValidatorMap<T> = void 0,
    _schema: TypeGuard<T> = any()
): TypeGuard<T[]> {
    if (!!rules && typeof rules === 'object' && !Array.isArray(rules))
        return array(object(rules) as unknown as TypeGuard<T>)

    if (!rules || typeof rules === 'function') {
        _schema = rules ?? _schema
        const guard = (arg: unknown): arg is T[] =>
            Array.isArray(arg) && arg.every(item => _schema(item))

        return setStructMetadata<T[]>(
            {
                type: 'object',
                schema: guard,
                optional: false,
                entries: getStructMetadata(_schema) as V3.GenericStruct<T>,
                rules: [],
            } as V3.ArrayStruct<T>,
            setRuleMessage(`Array<${getMessage(_schema)}>`, guard)
        )
    }

    const guard = (arg: unknown): arg is T[] =>
        branchIfOptional(arg, rules) ||
        (Array.isArray(arg) && isFollowingRules(arg, rules) && arg.every(item => _schema(item)))

    return setStructMetadata(
        {
            type: 'object',
            schema: guard,
            optional: false,
            entries: getStructMetadata(_schema) as V3.GenericStruct<T>,
            rules: rules.map(getRuleStructMetadata<ArrayRule>),
        },
        setRuleMessage(`Array<${getMessage(_schema)}>`, guard, rules)
    )
}

type OptionalizedArray = CallableFunction & {
    (): TypeGuard<any[] | undefined>
    (rules: ArrayRule[]): TypeGuard<any[] | undefined>
    <T>(rules: ArrayRule[], schema: TypeGuard<T>): TypeGuard<T[] | undefined>
    <T>(schema: TypeGuard<T>): TypeGuard<T[] | undefined>
    (tree: {}): TypeGuard<{}[] | undefined>
    <T>(tree: ValidatorMap<T>): TypeGuard<T[] | undefined>
}

export const array = optionalizeOverloadFactory(_fn).optionalize<OptionalizedArray>()
