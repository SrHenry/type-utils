import type { GetTypeGuard, TypeGuard } from '../../../../TypeGuards/types'
import type { OptionalizeTypeGuardClosure, TypeGuardClosure, V3 } from '../../types'

import { getMessage } from '../../../../TypeGuards/helpers/getMessage'
import { isTypeGuard } from '../../../../TypeGuards/helpers/isTypeGuard'
import { setMessage } from '../../../../TypeGuards/helpers/setMessage'
import { getRule } from '../../../rules/helpers/getRule'
import { ValidationError } from '../../../ValidationError'
import { getStructMetadata } from '../getStructMetadata'
import { setOptionalFlag } from '../optionalFlag'
import { setStructMetadata } from '../setStructMetadata'
import { OptionalizedTypeGuardFactory, TypeGuardFactory } from './types'

const wrapOptional =
    <T extends TypeGuardClosure>(fn: T): OptionalizeTypeGuardClosure<T> =>
    (...args: Parameters<T>) => {
        const closure = (arg: unknown): arg is GetTypeGuard<ReturnType<T>> =>
            getRule('optional')(arg) || fn(...args)(arg)

        setOptionalFlag(closure)

        return setStructMetadata(
            { ...getStructMetadata(fn(...args)), optional: true } as unknown as
                | V3.GenericStruct<T>
                | V3.AnyStruct,
            setMessage(getMessage(fn(...args)), closure)
        )
    }

function optional<Args extends any[], T>(
    factory: TypeGuardFactory<Args, T>
): TypeGuardFactory<Args, T | undefined> {
    const type = typeof factory
    if (type !== 'function')
        throw new ValidationError({
            message: "Can't optionalize! Parameter must be a function",
            value: factory,
            schema: isTypeGuard as TypeGuard<unknown>,
            name: `${type}$`,
        })

    return setOptionalFlag(wrapOptional(factory))
}

export function optionalize<Factory extends TypeGuardFactory>(
    factory: Factory
): OptionalizedTypeGuardFactory<Factory>

export function optionalize<Override, Factory extends TypeGuardFactory>(
    factory: Factory
): Factory & { optional: Override }

export function optionalize(factory: TypeGuardFactory) {
    return Object.assign(factory, {
        optional: optional(factory),
    })
}

export function optionalizeOverloadFactory<Factory extends TypeGuardFactory>(factory: Factory) {
    return {
        optionalize<Override>(): Factory & { optional: Override } {
            return optionalize(factory) as Factory & { optional: Override }
        },
    }
}
