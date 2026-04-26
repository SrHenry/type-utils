import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { Custom } from '../rules/types/index.ts'
import type { FluentSchema } from './types/FluentSchema.ts'

import { useCustomRules } from '../rules/helpers/useCustomRules.ts'
import { SchemaValidator } from '../SchemaValidator.ts'
import { branchIfOptional } from './helpers/branchIfOptional.ts'
import { copyStructMetadata } from './helpers/copyStructMetadata.ts'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata.ts'
import { optionalize } from './helpers/optional/index.ts'
import { setRuleMessage } from './helpers/setRuleMessage.ts'
import { setStructMetadata } from './helpers/setStructMetadata.ts'
import { validateCustomRules } from './helpers/validateCustomRules.ts'

function _fn(): TypeGuard<boolean> {
    const guard = (arg: unknown): arg is boolean =>
        branchIfOptional(arg, []) || typeof arg === 'boolean'

    return setStructMetadata(
        { type: 'boolean', schema: guard, optional: false, rules: [] },
        setRuleMessage('boolean', guard)
    )
}

export const _boolean = optionalize(_fn)

type BooleanSchema = CallableFunction & {
    (): FluentSchema<any>
}

export const boolean: BooleanSchema = (() => {
    const customRules: Custom<any[], string, boolean>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _boolean.optional : _boolean
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
                rules: customRules.map(getRuleStructMetadata<Custom<any[], string, any>>),
            })
        }

        if (fnName === 'use') {
            validateCustomRules(_rules)
            customRules.push(...(_rules as Custom<any[], string, boolean>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema, {
            rules: customRules.map(getRuleStructMetadata<Custom<any[], string, boolean>>),
        })
    }

    schema.optional = () => addCall('optional')
    schema.validator = (throwOnError = true) => addCall('validator', [], { throwOnError })
    schema.use = (...rules: Custom<any[], string, boolean>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema, {
        rules: customRules.map(getRuleStructMetadata<Custom<any[], string, boolean>>),
    })
}) as unknown as BooleanSchema
