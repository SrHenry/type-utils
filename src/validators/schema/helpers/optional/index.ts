import type { TypeGuard } from '../../../../TypeGuards/types'
import type { Func } from '../../../../types/Func'
import type {
    OptionalizedTypeGuardFactory,
    OptionalizeTypeGuardFactory,
    TypeGuardFactory,
    TypeGuardFactoryParameters,
    TypeGuardFactoryType,
} from './types'

import { getMessage } from '../../../../TypeGuards/helpers/getMessage'
import { isTypeGuard } from '../../../../TypeGuards/helpers/isTypeGuard'
import { setMessage } from '../../../../TypeGuards/helpers/setMessage'
import { getRule } from '../../../rules/helpers/getRule'
import { ValidationError } from '../../../ValidationError'
import { getStructMetadata } from '../getStructMetadata'
import { setOptionalFlag } from '../optionalFlag'
import { setStructMetadata } from '../setStructMetadata'

const wrapOptional = <Params extends any[], Guarded>(
    factoryFn: Func<Params, TypeGuard<Guarded>>
): OptionalizeTypeGuardFactory<Guarded, Params> => {
    return ((...args: Params): TypeGuard<Guarded | undefined> => {
        const baseGuard = factoryFn(...args)

        const closure = (arg: unknown): arg is Guarded | undefined =>
            getRule('optional')(arg) || baseGuard(arg)

        setOptionalFlag(closure)

        return setStructMetadata<any>(
            { ...getStructMetadata(baseGuard), optional: true },
            setMessage(getMessage(baseGuard), closure)
        )
    }) satisfies OptionalizeTypeGuardFactory<Guarded, Params>
}

function optional<Args extends any[], T>(
    factory: TypeGuardFactory<Args, T>
): OptionalizeTypeGuardFactory<T, Args> {
    if (typeof factory !== 'function') {
        throw new ValidationError({
            message: "Can't optionalize! Parameter must be a function",
            value: factory,
            schema: isTypeGuard as TypeGuard<unknown>,
            name: `${typeof factory}$`,
        })
    }

    return setOptionalFlag(wrapOptional(factory))
}
export function optionalize<Factory extends TypeGuardFactory>(
    factory: Factory
): OptionalizedTypeGuardFactory<TypeGuardFactoryType<Factory>, TypeGuardFactoryParameters<Factory>>

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
