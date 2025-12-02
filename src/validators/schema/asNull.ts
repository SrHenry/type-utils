import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { FluentSchema } from './types/FluentSchema'

import { useCustomRules } from '../rules/helpers/useCustomRules'
import { branchIfOptional } from './helpers/branchIfOptional'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { optionalize } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

function _fn(): TypeGuard<null> {
    const guard = (arg: unknown): arg is null => branchIfOptional(arg, []) || arg === null

    return setStructMetadata(
        { type: 'null', schema: guard, optional: false },
        setRuleMessage('null', guard)
    )
}

export const _null = optionalize(_fn)

type NullSchema = CallableFunction & {
    (): FluentSchema<null>
}

export const asNull: NullSchema = (() => {
    const customRules: Custom<any[], string, null>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _null.optional : _null
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
            customRules.push(...(_rules as Custom<any[], string, null>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema)
    }

    schema.optional = () => addCall('optional')

    schema.use = (...rules: Custom<any[], string, null>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema)
}) as unknown as NullSchema
