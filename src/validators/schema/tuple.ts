import type { TypeGuard } from '../../TypeGuards/types'
import type { V3 } from './types'

import { getMessage } from '../../TypeGuards/helpers/getMessage'

import { getStructMetadata } from './helpers/getStructMetadata'
import { setStructMetadata } from './helpers/setStructMetadata'

import { isTypeGuard } from '../../TypeGuards/helpers/isTypeGuard'
import { setMessage } from '../../TypeGuards/helpers/setMessage'
import { optionalizeOverloadFactory } from './helpers/optional'

const guardFactory =
    (schemas: TypeGuard<any>[]) =>
    (arg: unknown): arg is any => {
        if (!Array.isArray(arg)) return false

        if (schemas.length === 0 && arg.length === 0) return true // empty tuple case

        if (arg.length !== schemas.length) return false

        for (let i = 0; i < arg.length; i++) if (!schemas[i]!(arg[i])) return false

        return true
    }

function _fn<const T extends TypeGuard<any>[]>(schemas: T): TypeGuard<V3.TypeGuardTupleUnwrap<T>>
function _fn<const T extends TypeGuard<any>[]>(...schemas: T): TypeGuard<V3.TypeGuardTupleUnwrap<T>>

function _fn(
    this: unknown,
    _schemas?: TypeGuard<any> | TypeGuard<any>[],
    ...rest: TypeGuard<any>[]
): TypeGuard<any[]> {
    const schemas: TypeGuard<any>[] = []

    if (!Array.isArray(_schemas)) {
        if (_schemas) schemas.push(_schemas)

        if (rest.length > 0) schemas.push(...rest)
    } else schemas.push(..._schemas)

    if (!schemas.every(s => isTypeGuard(s))) throw new Error('All schemas must be type guards')

    const guard = guardFactory(schemas)

    return setStructMetadata(
        {
            type: 'tuple',
            schema: guard,
            optional: false,
            elements: schemas.map(s => getStructMetadata(s)),
        },
        setMessage(`tuple(${schemas.map(s => getMessage(s)).join(', ')})`, guard)
    )
}

type OptionalizedTuple = CallableFunction & {
    <const T extends TypeGuard<any>[]>(schemas: T): TypeGuard<
        undefined | V3.TypeGuardTupleUnwrap<T>
    >
    <const T extends TypeGuard<any>[]>(...schemas: T): TypeGuard<
        undefined | V3.TypeGuardTupleUnwrap<T>
    >
}

export const tuple = optionalizeOverloadFactory(_fn).optionalize<OptionalizedTuple>()
