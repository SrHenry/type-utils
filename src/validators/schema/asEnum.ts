import { Generics } from '../../Generics'
import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
} from './helpers'
import { primitive } from './primitive'

import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import type { V3 } from './types'

export function asEnum<T extends Generics.PrimitiveType>(values: T[]): TypeGuard<T> {
    const guard = (arg: unknown): arg is T =>
        branchIfOptional(arg, []) || (primitive()(arg) && values.some(value => value === arg))

    return enpipeSchemaStructIntoGuard<T>(
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
        enpipeRuleMessageIntoGuard(`enum [ ${values.map(String).join(' | ')} ]`, guard)
    )
}
