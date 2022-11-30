import { getMessage } from '../../TypeGuards/GenericTypeGuards'
import { BaseValidator } from '../BaseValidator'
import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    getStructMetadata,
    _hasOptionalProp,
} from './helpers'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import type { Sanitize, ValidatorArgs, ValidatorMap } from '../Validators'
import type { ObjectStruct } from './types'

export function object<T>(tree: ValidatorMap<T>): TypeGuard<Sanitize<T>>
export function object(): TypeGuard<Record<any, any>>
export function object(tree: {}): TypeGuard<{}>
export function object<T>(
    tree?: ValidatorMap<T> | {}
): TypeGuard<Sanitize<T> | Record<any, any> | {}> {
    const isBlankObject = (arg: unknown): arg is {} =>
        typeof arg === 'object' && !!arg && Object.keys(arg).length === 0
    if (!tree || isBlankObject(tree)) {
        const guard = (arg: unknown): arg is Record<any, any> | {} =>
            /* tree !== null &&  */ typeof arg === 'object'

        return enpipeSchemaStructIntoGuard(
            { type: 'object', schema: guard, optional: false, tree: {} },
            enpipeRuleMessageIntoGuard('object', guard)
        )
    }

    const keys = Object.keys(tree) as (keyof T)[]

    const optional = keys.filter(key => _hasOptionalProp(tree[key as keyof typeof tree]))
    const required = keys.filter(key => !_hasOptionalProp(tree[key as keyof typeof tree]))

    const config: ValidatorArgs<T> = { validators: tree, required, optional }

    const guard = (arg: unknown): arg is Sanitize<T> =>
        branchIfOptional(arg, []) || BaseValidator.hasValidProperties(arg, config)

    const message =
        '{ ' +
        Object.entries(tree)
            .map(
                ([k, v]) =>
                    `${String(k)}${optional.some(key => key === k) ? '?' : ''}: ${getMessage(v)}`
            )
            .join(', ') +
        ' }'

    const metadata = {
        type: 'object' as const,
        schema: guard,
        optional: false,
        // ObjectConstructor interface is weird, it requires a length property if you annotate entries method overload
        tree: Object.entries<TypeGuard<Sanitize<T>[keyof Sanitize<T>]>>(
            tree as unknown as ValidatorMap<Sanitize<T>> & { length: number }
        )
            .map(([k, v]) => ({ [k]: getStructMetadata(v) }))
            .reduce((acc, item) => Object.assign(acc, item), {}),
    } as ObjectStruct<Sanitize<T>>

    return enpipeSchemaStructIntoGuard<ObjectStruct<Sanitize<T>>>(
        metadata,
        enpipeRuleMessageIntoGuard(message, guard)
    )
}
