import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { FluentSchema } from './types/FluentSchema'

import { useCustomRules } from '../rules/helpers/useCustomRules'
import { branchIfOptional } from './helpers/branchIfOptional'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { optionalizeOverloadFactory } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

// TODO: Add overload for optional symbol instance to compare against
function _fn(): TypeGuard<symbol>

function _fn(): TypeGuard<symbol> {
    const guard = (arg: unknown): arg is symbol =>
        branchIfOptional(arg, []) || typeof arg === 'symbol'

    return setStructMetadata(
        { type: 'symbol', schema: guard, optional: false },
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

    const addCall = (fnName: string, _rules: unknown[] = []) => {
        if (callStack[fnName]) throw new Error(`Cannot call ${fnName} more than once`)

        if (fnName === 'use') {
            customRules.push(...(_rules as Custom<any[], string, symbol>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema)
    }

    schema.optional = () => addCall('optional')

    schema.use = (...rules: Custom<any[], string, symbol>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema)
}) as unknown as SymbolSchema
