import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { Custom } from '../rules/types/index.ts'
import type { Sanitize, ValidatorMap } from '../types/index.ts'
import type { V3 } from './types/index.ts'
import type { FluentSchema } from './types/FluentSchema.ts'

import { join } from '../../helpers/Experimental/join.ts'
import { map } from '../../helpers/Experimental/map.ts'
import { pipe } from '../../helpers/Experimental/pipeline/pipe.ts'
import { getMessage } from '../../TypeGuards/helpers/getMessage.ts'
import { BaseValidator } from '../BaseValidator.ts'
import { useCustomRules } from '../rules/helpers/useCustomRules.ts'
import { SchemaValidator } from '../SchemaValidator.ts'
import { branchIfOptional } from './helpers/branchIfOptional.ts'
import { copyStructMetadata } from './helpers/copyStructMetadata.ts'
import { getRuleStructMetadata } from './helpers/getRuleStructMetadata.ts'
import { getStructMetadata } from './helpers/getStructMetadata.ts'
import { optionalizeOverloadFactory } from './helpers/optional/index.ts'
import { hasOptionalFlag } from './helpers/optionalFlag.ts'
import { setRuleMessage } from './helpers/setRuleMessage.ts'
import { setStructMetadata } from './helpers/setStructMetadata.ts'
import { validateCustomRules } from './helpers/validateCustomRules.ts'
import { toStandardSchema } from '../standard-schema/toStandardSchema.ts'

function _fn<T extends {}>(tree: ValidatorMap<T>): TypeGuard<Sanitize<T>>
// function _fn<T extends ValidatorMap<any>>(tree: T): TypeGuard<GetTypeFromValidatorMap<T>>

function _fn(): TypeGuard<Record<any, any>>
function _fn(tree: {}): TypeGuard<{}>
function _fn<T extends {}>(tree?: ValidatorMap<T>): TypeGuard<T | Record<any, any> | {}> {
    const isBlankObject = (arg: unknown) =>
        typeof arg === 'object' && !!arg && Object.keys(arg).length === 0
    if (!tree || isBlankObject(tree)) {
        const guard = (arg: unknown): arg is Record<any, any> | {} =>
            tree !== null && typeof arg === 'object'

        return setStructMetadata(
            { type: 'object', schema: guard, optional: false, tree: {}, rules: [] },
            setRuleMessage('object', guard)
        )
    }

    const keys = Object.keys(tree)

    const optional = keys.filter(key => hasOptionalFlag(tree[key]))
    const required = keys.filter(key => !hasOptionalFlag(tree[key]))

    const config = { validators: tree, required, optional }

    const guard = (arg: unknown): arg is T =>
        branchIfOptional(arg, []) || BaseValidator.hasValidProperties(arg, config)

    const message = pipe(Object.entries(tree))
        .pipe(
            map(
                ([k, v]) =>
                    `${String(k)}${optional.some(key => key === k) ? '?' : ''}: ${getMessage(v)}`
            )
        )
        .pipe(join(', '))
        .pipe(inner => `{${inner}}`)
        .depipe()

    const metadata: V3.ObjectStruct<T> = {
        type: 'object' as const,
        schema: guard,
        optional: false,
        tree: Object.entries(tree)
            .map(([k, v]) => ({ [k]: getStructMetadata(v) as V3.StructType }))
            .reduce(
                (acc, item) => Object.assign(acc, item),
                {} as { [K in keyof T]: V3.GenericStruct<T[K]> | V3.StructType }
            ),
        rules: [],
    }

    return setStructMetadata<T>(metadata, setRuleMessage(message, guard))
}

type OptionalizedObject = {
    <T extends {}>(tree: ValidatorMap<T>): TypeGuard<undefined | Sanitize<T>>

    (): TypeGuard<undefined | Record<any, any>>
    (tree: {}): TypeGuard<undefined | {}>
}

export const _object = optionalizeOverloadFactory(_fn).optionalize<OptionalizedObject>()

type ObjectSchema = CallableFunction & {
    <T extends {}>(tree: ValidatorMap<T>): FluentSchema<Sanitize<T>>
    (): FluentSchema<Record<any, any>>
    (tree: {}): FluentSchema<{}>
}

export const object: ObjectSchema = ((tree?: ValidatorMap<any>) => {
    const customRules: Custom<any[], string, object>[] = []
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _object.optional : _object

        return tree ? resolver(tree) : resolver()
    }

    const schema = (arg: unknown): arg is object => {
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
                rules: customRules.map(getRuleStructMetadata<Custom<any[], string, object>>),
            })
        }

        if (fnName === 'use') {
            validateCustomRules(_rules)
            customRules.push(...(_rules as Custom<any[], string, object>[]))
        } else {
            callStack[fnName] = true
        }

        return copyStructMetadata(getGuard(), schema, {
            rules: customRules.map(getRuleStructMetadata<Custom<any[], string, object>>),
        })
    }

    schema.optional = () => addCall('optional')
    schema.validator = (throwOnError = true) => addCall('validator', [], { throwOnError })
    schema.use = (...rules: Custom<any[], string, object>) => addCall('use', [...rules])
schema.toStandardSchema = () => toStandardSchema(schema as unknown as TypeGuard<object>)

    return copyStructMetadata(getGuard(), schema, {
        rules: customRules.map(getRuleStructMetadata<Custom<any[], string, object>>),
    })
}) as unknown as ObjectSchema
