import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { FluentSchema } from './types/FluentSchema'

import { useCustomRules } from '../rules/helpers/useCustomRules'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { optionalize } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'

function _fn(): TypeGuard<any> {
    const guard = (_: unknown): _ is any => true

    return setStructMetadata(
        { type: 'any', schema: guard, optional: false },
        setRuleMessage('any', guard)
    )
}

export const _any = optionalize(_fn)

type AnySchema = CallableFunction & {
    (): FluentSchema<any>
}

export const any: AnySchema = (() => {
    const customRules: Custom<any[], string, any>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _any.optional : _any
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
            customRules.push(...(_rules as Custom<any[], string, any>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema)
    }

    schema.optional = () => addCall('optional')

    schema.use = (...rules: Custom<any[], string, any>) => addCall('use', [...rules])

    return copyStructMetadata(getGuard(), schema)
}) as unknown as AnySchema
