import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { Sanitize, ValidatorMap } from '../types'
import type { V3 } from './types'
import type { FluentSchema } from './types/FluentSchema'

import { join } from '../../helpers/Experimental/join'
import { map } from '../../helpers/Experimental/map'
import { pipe } from '../../helpers/Experimental/pipeline/pipe'
import { getMessage } from '../../TypeGuards/helpers/getMessage'
import { BaseValidator } from '../BaseValidator'
import { useCustomRules } from '../rules/helpers/useCustomRules'
import { branchIfOptional } from './helpers/branchIfOptional'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { getStructMetadata } from './helpers/getStructMetadata'
import { optionalizeOverloadFactory } from './helpers/optional'
import { hasOptionalFlag } from './helpers/optionalFlag'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

function _fn<T extends {}>(tree: ValidatorMap<T>): TypeGuard<Sanitize<T>>
// function _fn<T extends ValidatorMap<any>>(tree: T): TypeGuard<GetTypeFromValidatorMap<T>>

function _fn(): TypeGuard<Record<any, any>>
function _fn(tree: {}): TypeGuard<{}>
function _fn<T extends {}>(tree?: ValidatorMap<T>): TypeGuard<T | Record<any, any> | {}> {
    const isBlankObject = (arg: unknown) =>
        typeof arg === 'object' && !!arg && Object.keys(arg).length === 0
    if (!tree || isBlankObject(tree)) {
        const guard = (arg: unknown): arg is Record<any, any> | {} =>
            tree !== null && typeof arg === 'object'

        return setStructMetadata(
            { type: 'object', schema: guard, optional: false, tree: {} },
            setRuleMessage('object', guard)
        )
    }

    const keys = Object.keys(tree)

    const optional = keys.filter(key => hasOptionalFlag(tree[key]))
    const required = keys.filter(key => !hasOptionalFlag(tree[key]))

    const config = { validators: tree, required, optional }

    const guard = (arg: unknown): arg is T =>
        branchIfOptional(arg, []) || BaseValidator.hasValidProperties(arg, config)

    const message = pipe(Object.entries(tree))
        .pipe(
            map(
                ([k, v]) =>
                    `${String(k)}${optional.some(key => key === k) ? '?' : ''}: ${getMessage(v)}`
            )
        )
        .pipe(join(', '))
        .pipe(inner => `{${inner}}`)
        .depipe()

    // const message =
    //     '{ ' +
    //     Object.entries(tree)
    //         .map(
    //             ([k, v]) =>
    //                 `${String(k)}${optional.some(key => key === k) ? '?' : ''}: ${getMessage(v)}`
    //         )
    //         .join(', ') +
    //     ' }'

    const metadata = {
        type: 'object' as const,
        schema: guard,
        optional: false,
        // // ObjectConstructor interface is weird, it requires a length property if you annotate entries method overload
        // tree: Object.entries<TypeGuard<Sanitize<T>[keyof Sanitize<T>]>>(
        //     tree as unknown as ValidatorMap<Sanitize<T>> & { length: number }
        // )
        // .map(([k, v]) => ({ [k]: getStructMetadata(v) }))
        // .reduce((acc, item) => Object.assign(acc, item), {}),
        tree: Object.entries(tree)
            .map(([k, v]) => ({ [k]: getStructMetadata(v) }))
            .reduce((acc, item) => Object.assign(acc, item), {}),
    } as V3.ObjectStruct<T>

    return setStructMetadata<T>(metadata, setRuleMessage(message, guard))
}

type OptionalizedObject = {
    <T extends {}>(tree: ValidatorMap<T>): TypeGuard<undefined | Sanitize<T>>
    // <T extends ValidatorMap<any>>(tree: T): TypeGuard<undefined|GetTypeFromValidatorMap<T>>

    (): TypeGuard<undefined | Record<any, any>>
    (tree: {}): TypeGuard<undefined | {}>
}

export const _object = optionalizeOverloadFactory(_fn).optionalize<OptionalizedObject>()

type ObjectSchema = CallableFunction & {
    <T extends {}>(tree: ValidatorMap<T>): FluentSchema<Sanitize<T>>
    (): FluentSchema<Record<any, any>>
    (tree: {}): FluentSchema<{}>
}

export const object: ObjectSchema = ((tree?: ValidatorMap<any>) => {
    const customRules: Custom<any[], string, object>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _object.optional : _object

        return tree ? resolver(tree) : resolver()
    }

    const schema = (arg: unknown): arg is object => {
        const guard = getGuard()

        if (customRules.length > 0) {
            return useCustomRules(guard, ...customRules)(arg)
        }

        return guard(arg)
    }

    const addCall = (fnName: string, _rules: unknown[] = []) => {
        if (callStack[fnName]) throw new Error(`Cannot call ${fnName} more than once`)

        if (fnName === 'use') {
            customRules.push(...(_rules as Custom<any[], string, object>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema)
    }

    schema.optional = () => addCall('optional')

    schema.use = (...rules: Custom<any[], string, object>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema)
}) as unknown as ObjectSchema
