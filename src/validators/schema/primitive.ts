import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
} from './helpers'
import { Generics } from '../../Generics'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

export function primitive(): TypeGuard<Generics.PrimitiveType> {
    const guard = (arg: unknown): arg is Generics.PrimitiveType =>
        branchIfOptional(arg, []) || (Generics.Primitives as readonly string[]).includes(typeof arg)

    return enpipeSchemaStructIntoGuard(
        { type: 'primitive', schema: guard, optional: false },
        enpipeRuleMessageIntoGuard(
            'primitive (string | number | boolean | symbol | null | undefined)',
            guard
        )
    )
}
