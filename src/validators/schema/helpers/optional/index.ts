import type { TypeGuard } from '../../../../TypeGuards/types/index.ts'
import type { Func } from '../../../../types/Func.ts'
import type {
    OptionalizedTypeGuardFactory,
    OptionalizeTypeGuardFactory,
    TypeGuardFactory,
    TypeGuardFactoryParameters,
    TypeGuardFactoryType,
} from './types.ts'

import { getMessage } from '../../../../TypeGuards/helpers/getMessage.ts'
import { isTypeGuard } from '../../../../TypeGuards/helpers/isTypeGuard.ts'
import { setMessage } from '../../../../TypeGuards/helpers/setMessage.ts'
import { getRule } from '../../../rules/helpers/getRule.ts'
import { ValidationError } from '../../../ValidationError.ts'
import { getStructMetadata } from '../getStructMetadata.ts'
import { setOptionalFlag } from '../optionalFlag.ts'
import { setStructMetadata } from '../setStructMetadata.ts'

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
