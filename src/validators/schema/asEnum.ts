import type { Generics } from '../../Generics'
import type { TypeGuard } from '../../TypeGuards/types'
import type { Custom } from '../rules/types'
import type { V3 } from './types'
import type { FluentSchema } from './types/FluentSchema'

import { useCustomRules } from '../rules/helpers/useCustomRules'
import { branchIfOptional } from './helpers/branchIfOptional'
import { copyStructMetadata } from './helpers/copyStructMetadata'
import { optionalize } from './helpers/optional'
import { setRuleMessage } from './helpers/setRuleMessage'
import { setStructMetadata } from './helpers/setStructMetadata'
import { primitive } from './primitive'

function _fn<T extends Generics.PrimitiveType>(values: T[]): TypeGuard<T> {
    const guard = (arg: unknown): arg is T =>
        branchIfOptional(arg, []) || (primitive()(arg) && values.some(value => value === arg))

    return setStructMetadata<T>(
        {
            type: 'enum',
            schema: guard,
            optional: false,
            types: values.map(value => ({
                type: typeof value as Generics.Primitives,
                schema: (arg): arg is typeof value => value === arg,
                optional: false,
            })),
        } as V3.EnumStruct<T>,
        setRuleMessage(`enum [ ${values.map(String).join(' | ')} ]`, guard)
    )
}

export const _enum = optionalize(_fn)

type EnumSchema = CallableFunction & {
    <const T extends [...Generics.PrimitiveType[]]>(values: T): FluentSchema<T[number]>
}

export const asEnum: EnumSchema = ((values: any[]) => {
    const customRules: Custom<any[], string, Generics.PrimitiveType>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _enum.optional : _enum
        return resolver(values)
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
}) as unknown as EnumSchema
