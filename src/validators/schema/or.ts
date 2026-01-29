import type { GetTypeGuards, TypeGuard, TypeGuards } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { V3 } from './types'
import type { FluentSchema } from './types/FluentSchema'

import { getMessage } from '../../TypeGuards/helpers/getMessage'
import { useCustomRules } from '../rules/helpers/useCustomRules'
import { SchemaValidator } from '../SchemaValidator'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata'
import { getStructMetadata } from './helpers/getStructMetadata'
import { optionalizeOverloadFactory } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'
import { validateCustomRules } from './helpers/validateCustomRules'

function _fn<T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<T1 | T2>
function _fn<TGuards extends TypeGuards<any>>(
    ...guards: TGuards
): TypeGuard<V3.TUnion<GetTypeGuards<TGuards>>>

function _fn(...guards: TypeGuards<any>): TypeGuard<any> {
    const guard = (arg: unknown): arg is any => guards.some(typeGuard => typeGuard(arg))

    return setStructMetadata(
        {
            type: 'union',
            schema: guard,
            optional: false,
            types: guards.map(getStructMetadata),
            rules: [],
        },
        setRuleMessage(guards.map(getMessage).join(' | '), guard)
    )
}

type OptionalizedOr = {
    <T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<T1 | T2>
    <TGuards extends TypeGuards<any>>(
        ...guards: TGuards
    ): TypeGuard<V3.TUnion<GetTypeGuards<TGuards>>>
}

export const _or = optionalizeOverloadFactory(_fn).optionalize<OptionalizedOr>()

type UnionSchema = CallableFunction & {
    <T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): FluentSchema<T1 | T2>
    <TGuards extends [TypeGuard<any>, TypeGuard<any>, ...TypeGuard<any>[]]>(
        guards: TGuards
    ): FluentSchema<V3.TUnion<GetTypeGuards<TGuards>>>
}

export const or: UnionSchema = ((
    guard1: TypeGuard<any>,
    guard2: TypeGuard<any>,
    ...rest: TypeGuard<any>[]
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

    return copyStructMetadata(getGuard(), schema, {
        rules: customRules.map(getRuleStructMetadata<Custom<any[], string, any>>),
    })
}) as unknown as UnionSchema
