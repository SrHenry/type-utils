import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { V3 } from './types'
import type { FluentSchema } from './types/FluentSchema'

import { Generics } from '../../Generics'
import { useCustomRules } from '../rules/helpers/useCustomRules'
import { branchIfOptional } from './helpers/branchIfOptional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

import { copyStructMetadata } from './helpers/copyStructMetadata'
import { optionalize } from './helpers/optional'

function _fn(): TypeGuard<Generics.PrimitiveType> {
    const guard = (arg: unknown): arg is Generics.PrimitiveType =>
        branchIfOptional(arg, []) || (Generics.Primitives as readonly string[]).includes(typeof arg)

    return setStructMetadata(
        { type: 'primitive', schema: guard, optional: false } as V3.PrimitiveStruct,
        setRuleMessage(
            'primitive (string | number | bigint | boolean | symbol | null | undefined)',
            guard
        )
    )
}

export const _primitive = optionalize(_fn)

type PrimitiveSchema = CallableFunction & {
    (): FluentSchema<Generics.PrimitiveType>
}

export const primitive: PrimitiveSchema = (() => {
    const customRules: Custom<any[], string, Generics.PrimitiveType>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _primitive.optional : _primitive
        return resolver()
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
            customRules.push(...(_rules as Custom<any[], string, Generics.PrimitiveType>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema)
    }

    schema.optional = () => addCall('optional')

    schema.use = (...rules: Custom<any[], string, Generics.PrimitiveType>) =>
        addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema)
}) as unknown as PrimitiveSchema
