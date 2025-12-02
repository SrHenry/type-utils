import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { FluentSchema } from './types/FluentSchema'

import { useCustomRules } from '../rules/helpers/useCustomRules'
import { branchIfOptional } from './helpers/branchIfOptional'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { optionalize } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

function _fn(): TypeGuard<boolean> {
    const guard = (arg: unknown): arg is boolean =>
        branchIfOptional(arg, []) || typeof arg === 'boolean'

    return setStructMetadata(
        { type: 'boolean', schema: guard, optional: false },
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

    const addCall = (fnName: string, _rules: unknown[] = []) => {
        if (callStack[fnName]) throw new Error(`Cannot call ${fnName} more than once`)

        if (fnName === 'use') {
            customRules.push(...(_rules as Custom<any[], string, boolean>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema)
    }

    schema.optional = () => addCall('optional')

    schema.use = (...rules: Custom<any[], string, boolean>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema)
}) as unknown as BooleanSchema
