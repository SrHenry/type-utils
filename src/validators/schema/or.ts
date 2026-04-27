import type { TypeGuard } from '../../TypeGuards/types/index.ts'
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

type UnionSchemaEntry<T = any> = TypeGuard<T> | StandardSchemaV1<T, T>

type GetUnionEntryType<T> = T extends TypeGuard<infer U>
  ? U
  : T extends StandardSchemaV1<infer U, any>
    ? U
    : never

type GetUnionEntryTypes<T extends any[]> = T extends []
  ? []
  : T extends [infer U, ...infer V]
    ? [GetUnionEntryType<U>, ...GetUnionEntryTypes<V>]
    : any[]

function _fn<T1, T2>(guard1: UnionSchemaEntry<T1>, guard2: UnionSchemaEntry<T2>): TypeGuard<T1 | T2>
function _fn<TEntries extends UnionSchemaEntry[]>(
  ...guards: TEntries
): TypeGuard<V3.TUnion<GetUnionEntryTypes<TEntries>>>

function _fn(...guards: UnionSchemaEntry[]): TypeGuard<any> {
  const normalized = guards.map(g => normalizeSchema(g))
  const guard = (arg: unknown): arg is any => normalized.some(typeGuard => typeGuard(arg))

  return setStructMetadata(
    {
      type: 'union',
      schema: guard,
      optional: false,
      types: normalized.map(getStructMetadata),
      rules: [],
    },
    setRuleMessage(normalized.map(getMessage).join(' | '), guard)
  )
}

type OptionalizedOr = {
  <T1, T2>(guard1: UnionSchemaEntry<T1>, guard2: UnionSchemaEntry<T2>): TypeGuard<T1 | T2>
  <TEntries extends UnionSchemaEntry[]>(
    ...guards: TEntries
  ): TypeGuard<V3.TUnion<GetUnionEntryTypes<TEntries>>>
}

export const _or = optionalizeOverloadFactory(_fn).optionalize<OptionalizedOr>()

type UnionSchema = CallableFunction & {
  <T1, T2>(guard1: UnionSchemaEntry<T1>, guard2: UnionSchemaEntry<T2>): FluentSchema<T1 | T2>
  <TEntries extends [UnionSchemaEntry<any>, UnionSchemaEntry<any>, ...UnionSchemaEntry[]]>(
    guards: TEntries
  ): FluentSchema<V3.TUnion<GetUnionEntryTypes<TEntries>>>
}

export const or: UnionSchema = ((
  guard1: UnionSchemaEntry<any>,
  guard2: UnionSchemaEntry<any>,
  ...rest: UnionSchemaEntry<any>[]
) => {
    const customRules: Custom<any[], string, any>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _or.optional : _or
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
    schema.validator = (throwOnError = true) => addCall('validator', [], { throwOnError })
    schema.use = (...rules: Custom<any[], string, any>) => addCall('use', [...rules])
schema.toStandardSchema = () => toStandardSchema(schema as unknown as TypeGuard<any>)

    return copyStructMetadata(getGuard(), schema, {
        rules: customRules.map(getRuleStructMetadata<Custom<any[], string, any>>),
    })
}) as unknown as UnionSchema
