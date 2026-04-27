import type { Generics } from '../../Generics/index.ts'
import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { Custom } from '../rules/types/index.ts'
import type { V3 } from './types/index.ts'
import type { FluentSchema } from './types/FluentSchema.ts'

import { useCustomRules } from '../rules/helpers/useCustomRules.ts'
import { SchemaValidator } from '../SchemaValidator.ts'
import { toStandardSchema } from '../standard-schema/toStandardSchema.ts'
import { branchIfOptional } from './helpers/branchIfOptional.ts'
import { copyStructMetadata } from './helpers/copyStructMetadata.ts'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata.ts'
import { optionalize } from './helpers/optional/index.ts'
import { setRuleMessage } from './helpers/setRuleMessage.ts'
import { setStructMetadata } from './helpers/setStructMetadata.ts'
import { validateCustomRules } from './helpers/validateCustomRules.ts'
import { primitive } from './primitive.ts'

function _fn<T extends Generics.PrimitiveType>(values: T[]): TypeGuard<T> {
    if (values.length < 2)
        throw new TypeError('An enum schema must have at least two values to match')

    const guard = (arg: unknown): arg is T =>
        branchIfOptional(arg, []) || (primitive()(arg) && values.some(value => value === arg))

    return setStructMetadata<T>(
        {
            type: 'enum',
            schema: guard,
            optional: false,
            types: values.map(value => ({
                type: typeof value as Generics.Primitives,
                schema: (arg: unknown): arg is typeof value => value === arg,
                optional: false,
                rules: [],
            })) as (V3.AsPrimitiveStruct<Generics.Primitives> & V3.RequiredPartialStruct)[],
            rules: [],
        } satisfies V3.EnumStruct<T>,
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
  schema.toStandardSchema = () => toStandardSchema(schema as unknown as TypeGuard<Generics.PrimitiveType>)

    return copyStructMetadata(getGuard(), schema, {
        rules: customRules.map(
            getRuleStructMetadata<Custom<any[], string, Generics.PrimitiveType>>
        ),
    })
}) as unknown as EnumSchema
