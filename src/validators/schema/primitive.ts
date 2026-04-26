import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { Custom } from '../rules/types/index.ts'
import type { V3 } from './types/index.ts'
import type { FluentSchema } from './types/FluentSchema.ts'

import { Generics } from '../../Generics/index.ts'
import { useCustomRules } from '../rules/helpers/useCustomRules.ts'
import { branchIfOptional } from './helpers/branchIfOptional.ts'
import { setRuleMessage } from './helpers/setRuleMessage.ts'
import { setStructMetadata } from './helpers/setStructMetadata.ts'

import { SchemaValidator } from '../SchemaValidator.ts'
import { copyStructMetadata } from './helpers/copyStructMetadata.ts'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata.ts'
import { optionalize } from './helpers/optional/index.ts'
import { validateCustomRules } from './helpers/validateCustomRules.ts'

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
                rules: customRules.map(
                    getRuleStructMetadata<Custom<any[], string, Generics.PrimitiveType>>
                ),
            })
        }

        if (fnName === 'use') {
            validateCustomRules(_rules)
            customRules.push(...(_rules as Custom<any[], string, Generics.PrimitiveType>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema, {
            rules: customRules.map(
                getRuleStructMetadata<Custom<any[], string, Generics.PrimitiveType>>
            ),
        })
    }

    schema.optional = () => addCall('optional')
    schema.validator = (throwOnError = true) => addCall('validator', [], { throwOnError })
    schema.use = (...rules: Custom<any[], string, Generics.PrimitiveType>) =>
        addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema, {
        rules: customRules.map(
            getRuleStructMetadata<Custom<any[], string, Generics.PrimitiveType>>
        ),
    })
}) as unknown as PrimitiveSchema
