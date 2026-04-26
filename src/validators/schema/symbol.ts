import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { Custom } from '../rules/types/index.ts'
import type { FluentSchema } from './types/FluentSchema.ts'

import { useCustomRules } from '../rules/helpers/useCustomRules.ts'
import { SchemaValidator } from '../SchemaValidator.ts'
import { branchIfOptional } from './helpers/branchIfOptional.ts'
import { copyStructMetadata } from './helpers/copyStructMetadata.ts'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata.ts'
import { optionalizeOverloadFactory } from './helpers/optional/index.ts'
import { setRuleMessage } from './helpers/setRuleMessage.ts'
import { setStructMetadata } from './helpers/setStructMetadata.ts'
import { validateCustomRules } from './helpers/validateCustomRules.ts'

// TODO: Add overload for optional symbol instance to compare against
function _fn(): TypeGuard<symbol>

function _fn(): TypeGuard<symbol> {
    const guard = (arg: unknown): arg is symbol =>
        branchIfOptional(arg, []) || typeof arg === 'symbol'

    return setStructMetadata(
        {
            type: 'symbol',
            schema: guard,
            optional: false,
            rules: [],
        },
        setRuleMessage('symbol', guard)
    )
}

type OptionalizedSymbol = {
    (): TypeGuard<undefined | symbol>
}

export const _symbol = optionalizeOverloadFactory(_fn).optionalize<OptionalizedSymbol>()

type SymbolSchema = CallableFunction & {
    (): FluentSchema<symbol>
}

export const symbol: SymbolSchema = (() => {
    const customRules: Custom<any[], string, symbol>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _symbol.optional : _symbol
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
                rules: customRules.map(getRuleStructMetadata<Custom<any[], string, symbol>>),
            })
        }

        if (fnName === 'use') {
            validateCustomRules(_rules)
            customRules.push(...(_rules as Custom<any[], string, symbol>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema, {
            rules: customRules.map(getRuleStructMetadata<Custom<any[], string, symbol>>),
        })
    }

    schema.optional = () => addCall('optional')
    schema.validator = (throwOnError = true) => addCall('validator', [], { throwOnError })
    schema.use = (...rules: Custom<any[], string, symbol>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema, {
        rules: customRules.map(getRuleStructMetadata<Custom<any[], string, symbol>>),
    })
}) as unknown as SymbolSchema
