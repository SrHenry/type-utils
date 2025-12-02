import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { FluentSchema } from './types/FluentSchema'

import { useCustomRules } from '../rules/helpers/useCustomRules'
import { branchIfOptional } from './helpers/branchIfOptional'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { optionalize } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

function _fn(): TypeGuard<undefined> {
    const guard = (arg: unknown): arg is undefined => branchIfOptional(arg, []) || arg === void 0

    return setStructMetadata(
        { type: 'undefined', schema: guard, optional: false },
        setRuleMessage('undefined', guard)
    )
}

export const _undefined = optionalize(_fn)

type UndefinedSchema = CallableFunction & {
    (): FluentSchema<undefined>
}

export const asUndefined: UndefinedSchema = (() => {
    const customRules: Custom<any[], string, undefined>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _undefined.optional : _undefined
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
            customRules.push(...(_rules as Custom<any[], string, undefined>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema)
    }

    schema.optional = () => addCall('optional')

    schema.use = (...rules: Custom<any[], string, undefined>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema)
}) as unknown as UndefinedSchema
