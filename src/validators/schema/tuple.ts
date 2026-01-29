import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { V3 } from './types'
import type { FluentSchema } from './types/FluentSchema'

import { getMessage } from '../../TypeGuards/helpers/getMessage'
import { isTypeGuard } from '../../TypeGuards/helpers/isTypeGuard'
import { setMessage } from '../../TypeGuards/helpers/setMessage'
import { useCustomRules } from '../rules/helpers/useCustomRules'
import { SchemaValidator } from '../SchemaValidator'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata'
import { getStructMetadata } from './helpers/getStructMetadata'
import { optionalizeOverloadFactory } from './helpers/optional'
import { setStructMetadata } from './helpers/setStructMetadata'
import { validateCustomRules } from './helpers/validateCustomRules'

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
            rules: [],
        },
        setMessage(`tuple(${schemas.map(s => getMessage(s)).join(', ')})`, guard)
    )
}

type OptionalizedTuple = CallableFunction & {
    <const T extends TypeGuard<any>[]>(
        schemas: T
    ): TypeGuard<undefined | V3.TypeGuardTupleUnwrap<T>>
    <const T extends TypeGuard<any>[]>(
        ...schemas: T
    ): TypeGuard<undefined | V3.TypeGuardTupleUnwrap<T>>
}

export const _tuple = optionalizeOverloadFactory(_fn).optionalize<OptionalizedTuple>()

type TupleSchema = CallableFunction & {
    <const T extends TypeGuard<any>[]>(schemas: T): FluentSchema<V3.TypeGuardTupleUnwrap<T>>
    <const T extends TypeGuard<any>[]>(...schemas: T): FluentSchema<V3.TypeGuardTupleUnwrap<T>>
}

export const tuple: TupleSchema = ((
    _schema?: TypeGuard<any> | TypeGuard<any>[],
    ...rest: TypeGuard<any>[]
) => {
    const customRules: Custom<any[], string, [...any]>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _tuple.optional : _tuple
        return _schema
            ? typeof _schema === 'function'
                ? resolver([_schema, ...rest])
                : resolver(_schema)
            : resolver([])
    }

    const schema = (arg: unknown) => {
        const guard = getGuard()

        if (customRules.length > 0) {
            return useCustomRules(guard as TypeGuard<[...any]>, ...customRules)(arg)
        }

        return guard(arg)
    }

    const addCall = (
        fnName: string,
        _rules: unknown[] = [],
        { throwOnError = true }: Record<string, any> = {}
    ) => {
        if (callStack[fnName]) throw new Error(`Cannot call ${fnName} more than once`)

        if (fnName === 'validator') {
            const validator = (arg: unknown) =>
                SchemaValidator.validate(arg, schema as unknown as TypeGuard<any>, throwOnError)

            Object.assign(validator, {
                validate: validator,
            })

            return copyStructMetadata(getGuard(), validator, {
                rules: customRules.map(getRuleStructMetadata<Custom<any[], string, [...any]>>),
            })
        }

        if (fnName === 'use') {
            validateCustomRules(_rules)
            customRules.push(...(_rules as Custom<any[], string, [...any]>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard() as TypeGuard<[...any]>, schema, {
            rules: customRules.map(getRuleStructMetadata<Custom<any[], string, [...any]>>),
        })
    }

    schema.optional = () => addCall('optional')
    schema.validator = (throwOnError = true) => addCall('validator', [], { throwOnError })
    schema.use = (...rules: Custom<any[], string, [...any]>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard() as TypeGuard<[...any]>, schema, {
        rules: customRules.map(getRuleStructMetadata<Custom<any[], string, [...any]>>),
    })
}) as unknown as TupleSchema
