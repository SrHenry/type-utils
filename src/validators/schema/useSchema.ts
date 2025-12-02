import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { FluentSchema } from './types/FluentSchema'

import { useCustomRules } from '../rules/helpers/useCustomRules'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { optionalize } from './helpers/optional'

function _fn<T>(schema: TypeGuard<T>): TypeGuard<T> {
    return schema
}

export const _useSchema = optionalize(_fn)

type DelegateSchema = CallableFunction & {
    <T>(schema: TypeGuard<T>): FluentSchema<T>
}

export const useSchema: DelegateSchema = ((_schema: TypeGuard<any>) => {
    const customRules: Custom<any[], string, any>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _useSchema.optional : _useSchema
        return resolver(_schema)
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
}) as unknown as DelegateSchema
