import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { Custom } from '../rules/types/index.ts'
import type { StandardSchemaV1 } from '../standard-schema/types.ts'
import type { V3 } from './types/index.ts'
import type { FluentSchema } from './types/FluentSchema.ts'

import { getMessage } from '../../TypeGuards/helpers/getMessage.ts'
import { setMessage } from '../../TypeGuards/helpers/setMessage.ts'
import { useCustomRules } from '../rules/helpers/useCustomRules.ts'
import { normalizeSchema } from '../standard-schema/normalizeSchema.ts'
import { isStandardSchema } from '../standard-schema/isStandardSchema.ts'
import { SchemaValidator } from '../SchemaValidator.ts'
import { copyStructMetadata } from './helpers/copyStructMetadata.ts'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata.ts'
import { getStructMetadata } from './helpers/getStructMetadata.ts'
import { optionalizeOverloadFactory } from './helpers/optional/index.ts'
import { setStructMetadata } from './helpers/setStructMetadata.ts'
import { validateCustomRules } from './helpers/validateCustomRules.ts'
import { toStandardSchema } from '../standard-schema/toStandardSchema.ts'

type TupleSchemaEntry<T = any> = TypeGuard<T> | StandardSchemaV1<T, T>

const guardFactory =
    (schemas: TypeGuard<any>[]) =>
    (arg: unknown): arg is any => {
        if (!Array.isArray(arg)) return false

        if (schemas.length === 0 && arg.length === 0) return true // empty tuple case

        if (arg.length !== schemas.length) return false

        for (let i = 0; i < arg.length; i++) if (!schemas[i]!(arg[i])) return false

        return true
    }

function _fn<const T extends TupleSchemaEntry[]>(schemas: T): TypeGuard<V3.TypeGuardTupleUnwrap<T>>
function _fn<const T extends TupleSchemaEntry[]>(...schemas: T): TypeGuard<V3.TypeGuardTupleUnwrap<T>>

function _fn(
  this: unknown,
  _schemas?: TupleSchemaEntry | TupleSchemaEntry[],
  ...rest: TupleSchemaEntry[]
): TypeGuard<any[]> {
  const rawSchemas: TupleSchemaEntry[] = []

  if (!Array.isArray(_schemas)) {
    if (_schemas) rawSchemas.push(_schemas)

    if (rest.length > 0) rawSchemas.push(...rest)
  } else rawSchemas.push(..._schemas)

  const schemas = rawSchemas.map(s => normalizeSchema(s))

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
  <const T extends TupleSchemaEntry[]>(
    schemas: T
  ): TypeGuard<undefined | V3.TypeGuardTupleUnwrap<T>>
  <const T extends TupleSchemaEntry[]>(
    ...schemas: T
  ): TypeGuard<undefined | V3.TypeGuardTupleUnwrap<T>>
}

export const _tuple = optionalizeOverloadFactory(_fn).optionalize<OptionalizedTuple>()

type TupleSchema = CallableFunction & {
  <const T extends TupleSchemaEntry[]>(schemas: T): FluentSchema<V3.TypeGuardTupleUnwrap<T>>
  <const T extends TupleSchemaEntry[]>(...schemas: T): FluentSchema<V3.TypeGuardTupleUnwrap<T>>
}

export const tuple: TupleSchema = ((
  _schema?: TupleSchemaEntry | TupleSchemaEntry[],
  ...rest: TupleSchemaEntry[]
) => {
    const customRules: Custom<any[], string, [...any]>[] = []
    const callStack: { [key: string]: boolean } = {}

  const getGuard = () => {
    const resolver = callStack['optional'] ? _tuple.optional : _tuple
    if (!_schema) return resolver([])
    if (typeof _schema === 'function') return resolver([_schema, ...rest])
    if (Array.isArray(_schema)) return resolver(_schema)
    if (isStandardSchema(_schema)) return resolver([_schema, ...rest])
    return resolver([_schema as TupleSchemaEntry, ...rest])
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
schema.toStandardSchema = () => toStandardSchema(schema as unknown as TypeGuard<[...any]>)

    return copyStructMetadata(getGuard() as TypeGuard<[...any]>, schema, {
        rules: customRules.map(getRuleStructMetadata<Custom<any[], string, [...any]>>),
    })
}) as unknown as TupleSchema
