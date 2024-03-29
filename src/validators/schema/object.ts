import { getMessage } from '../../TypeGuards/GenericTypeGuards'
import { BaseValidator } from '../BaseValidator'
import {
    _hasOptionalProp,
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    getStructMetadata,
} from './helpers'

import { join } from '../../helpers/Experimental/join'
import { map } from '../../helpers/Experimental/map'
import { pipe } from '../../helpers/Experimental/pipeline'
import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import type { Sanitize, ValidatorMap } from '../Validators'
import type { V3 } from './types'

export function object<T extends {}>(tree: ValidatorMap<T>): TypeGuard<Sanitize<T>>
// export function object<T extends ValidatorMap<any>>(tree: T): TypeGuard<GetTypeFromValidatorMap<T>>

export function object(): TypeGuard<Record<any, any>>
export function object(tree: {}): TypeGuard<{}>
export function object<T extends {}>(tree?: ValidatorMap<T>): TypeGuard<T | Record<any, any> | {}> {
    const isBlankObject = (arg: unknown) =>
        typeof arg === 'object' && !!arg && Object.keys(arg).length === 0
    if (!tree || isBlankObject(tree)) {
        const guard = (arg: unknown): arg is Record<any, any> | {} =>
            tree !== null && typeof arg === 'object'

        return enpipeSchemaStructIntoGuard(
            { type: 'object', schema: guard, optional: false, tree: {} },
            enpipeRuleMessageIntoGuard('object', guard)
        )
    }

    const keys = Object.keys(tree)

    const optional = keys.filter(key => _hasOptionalProp(tree[key]))
    const required = keys.filter(key => !_hasOptionalProp(tree[key]))

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

    return enpipeSchemaStructIntoGuard<T>(metadata, enpipeRuleMessageIntoGuard(message, guard))
}
