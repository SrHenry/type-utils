import type { TypeGuard } from '../../TypeGuards/types'
import { ArrayRules, type ArrayRule } from '../rules/Array'
import type { Custom } from '../rules/types'
import type { ValidatorMap } from '../types'
import type { V3 } from './types'
import type { ArraySchema } from './types/ArraySchema'

import { getMessage } from '../../TypeGuards/helpers/getMessage'
import { useCustomRules } from '../rules/helpers/useCustomRules'
import { any } from './any'
import { branchIfOptional } from './helpers/branchIfOptional'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata'
import { getStructMetadata } from './helpers/getStructMetadata'
import { isFollowingRules } from './helpers/isFollowingRules'
import { optionalizeOverloadFactory } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'
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
        return _fn(object(rules) as unknown as TypeGuard<T>)

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

export const _array = optionalizeOverloadFactory(_fn).optionalize<OptionalizedArray>()

export const array: ArraySchema = ((tree_schema?: TypeGuard<any> | ValidatorMap<any>) => {
    const rules: ArrayRule[] = []
    const customRules: Custom<any[], string, any[]>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _array.optional : _array
        return tree_schema
            ? typeof tree_schema === 'function'
                ? resolver(rules, tree_schema)
                : resolver(rules, object(tree_schema))
            : resolver(rules)
    }

    const schema = (arg: unknown) => {
        const guard = getGuard()

        if (customRules.length > 0) {
            return useCustomRules(guard, ...customRules)(arg)
        }

        return guard(arg)
    }

    const addCall = (fnName: string, _rules: unknown[] = []) => {
        if (callStack[fnName]) throw new Error(`Cannot call ${fnName} more than once`)

        if (fnName === 'use') {
            customRules.push(...(_rules as Custom<any[], string, any[]>[]))
        } else {
            callStack[fnName] = true

            if (fnName !== 'optional') rules.push(...(_rules as ArrayRule[]))
        }

        return copyStructMetadata(getGuard(), schema)
    }

    schema.optional = () => addCall('optional')
    schema.unique = (deepObject: boolean = true) =>
        addCall('unique', [ArrayRules.unique(deepObject)])
    schema.min = (n: number) => addCall('min', [ArrayRules.min(n)])
    schema.max = (n: number) => addCall('max', [ArrayRules.max(n)])
    schema.use = (...rules: Custom<any[], string, any[]>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema)
}) as unknown as ArraySchema
