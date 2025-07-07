import type { Generics } from '../../Generics'
import type { TypeGuard } from '../../TypeGuards/types'
import type { V3 } from './types'

import { branchIfOptional } from './helpers/branchIfOptional'
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

export const asEnum = optionalize(_fn)
