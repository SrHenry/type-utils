import { enpipeRuleMessageIntoGuard, enpipeSchemaStructIntoGuard } from './helpers'
import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

export function any(): TypeGuard<any> {
    const guard = (_: unknown): _ is any => true

    return enpipeSchemaStructIntoGuard(
        { type: 'any', schema: guard, optional: false },
        enpipeRuleMessageIntoGuard('any', guard)
    )
}
