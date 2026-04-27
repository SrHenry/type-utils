import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { Merge } from '../../types/index.ts'
import type { Custom } from '../rules/types/index.ts'
import type { StandardSchemaV1 } from '../standard-schema/types.ts'
import type { V3 } from './types/index.ts'
import type { FluentSchema } from './types/FluentSchema.ts'

import { getMessage } from '../../TypeGuards/helpers/getMessage.ts'
import { useCustomRules } from '../rules/helpers/useCustomRules.ts'
import { normalizeSchema } from '../standard-schema/normalizeSchema.ts'
import { SchemaValidator } from '../SchemaValidator.ts'
import { copyStructMetadata } from './helpers/copyStructMetadata.ts'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata.ts'
import { getStructMetadata } from './helpers/getStructMetadata.ts'
import { optionalizeOverloadFactory } from './helpers/optional/index.ts'
import { setRuleMessage } from './helpers/setRuleMessage.ts'
import { setStructMetadata } from './helpers/setStructMetadata.ts'
import { validateCustomRules } from './helpers/validateCustomRules.ts'
import { toStandardSchema } from '../standard-schema/toStandardSchema.ts'

type IntersectionSchemaEntry<T = any> = TypeGuard<T> | StandardSchemaV1<T, T>

type GetIntersectionEntryType<T> = T extends TypeGuard<infer U>
  ? U
  : T extends StandardSchemaV1<infer U, any>
    ? U
    : never

type GetIntersectionEntryTypes<T extends any[]> = T extends []
  ? []
  : T extends [infer U, ...infer V]
    ? [GetIntersectionEntryType<U>, ...GetIntersectionEntryTypes<V>]
    : any[]

function _fn<T1, T2>(guard1: IntersectionSchemaEntry<T1>, guard2: IntersectionSchemaEntry<T2>): TypeGuard<Merge<T1, T2>>
function _fn<TEntries extends [IntersectionSchemaEntry<any>, IntersectionSchemaEntry<any>, ...IntersectionSchemaEntry[]]>(
  ...guards: TEntries
): TypeGuard<V3.TIntersection<GetIntersectionEntryTypes<TEntries>>>

function _fn(...guards: IntersectionSchemaEntry<any>[]): TypeGuard<any> {
  if (guards.length < 2)
    throw new Error('At least two guards are required in a intersection schema')

  const normalized = guards.map(g => normalizeSchema(g))
  const guard = (arg: unknown): arg is any => normalized.every(typeGuard => typeGuard(arg))

  return setStructMetadata(
    {
      type: 'intersection',
      schema: guard,
      optional: false,
      types: normalized.map(getStructMetadata<any>),
      rules: [],
    },
    setRuleMessage(normalized.map(getMessage).join(' & '), guard)
  )
}

type OptionalizedAnd = {
  <T1, T2>(guard1: IntersectionSchemaEntry<T1>, guard2: IntersectionSchemaEntry<T2>): TypeGuard<undefined | Merge<T1, T2>>
  <TEntries extends [IntersectionSchemaEntry<any>, IntersectionSchemaEntry<any>, ...IntersectionSchemaEntry[]]>(
    ...guards: TEntries
  ): TypeGuard<undefined | V3.TIntersection<GetIntersectionEntryTypes<TEntries>>>
}

export const _and = optionalizeOverloadFactory(_fn).optionalize<OptionalizedAnd>()

type IntersectionSchema = CallableFunction & {
  <T1, T2>(guard1: IntersectionSchemaEntry<T1>, guard2: IntersectionSchemaEntry<T2>): FluentSchema<T1 & T2>
  <TEntries extends [IntersectionSchemaEntry<any>, IntersectionSchemaEntry<any>, ...IntersectionSchemaEntry[]]>(
    ...guards: TEntries
  ): FluentSchema<V3.TIntersection<GetIntersectionEntryTypes<TEntries>>>
}

export const and: IntersectionSchema = ((
  guard1: IntersectionSchemaEntry<any>,
  guard2: IntersectionSchemaEntry<any>,
  ...rest: IntersectionSchemaEntry<any>[]
) => {
    const customRules: Custom<any[], string, any>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _and.optional : _and
        return rest.length > 0 ? resolver(guard1, guard2, ...rest) : resolver(guard1, guard2)
    }

    const schema = (arg: unknown) => {
        const guard = getGuard()

        if (customRules.length > 0) {
            return useCustomRules(guard, ...customRules)(arg)
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
                rules: customRules.map(getRuleStructMetadata<Custom<any[], string, any>>),
            })
        }

        if (fnName === 'use') {
            validateCustomRules(_rules)
            customRules.push(...(_rules as Custom<any[], string, any>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema, {
            rules: customRules.map(getRuleStructMetadata<Custom<any[], string, any>>),
        })
    }

    schema.optional = () => addCall('optional')
    schema.use = (...rules: Custom<any[], string, any>) => addCall('use', [...rules])
    schema.validator = (throwOnError: boolean = true) => addCall('validator', [], { throwOnError })
schema.toStandardSchema = () => toStandardSchema(schema as unknown as TypeGuard<any>)

    return copyStructMetadata(getGuard(), schema, {
        rules: customRules.map(getRuleStructMetadata<Custom<any[], string, any>>),
    })
}) as unknown as IntersectionSchema
