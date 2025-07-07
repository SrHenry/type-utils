import type { TypeGuard } from '../../../TypeGuards/types'
import type { Default as DefaultRules } from '../../rules/types'

import { setMessage } from '../../../TypeGuards/helpers'
import { getRule } from '../../rules/helpers/getRule'
import { getRuleMessages } from './getRuleMessages'

export function setRuleMessage<T>(prepend: string, guard: TypeGuard<T>): typeof guard
export function setRuleMessage<T>(
    prepend: string,
    guard: TypeGuard<T>,
    rules: DefaultRules[]
): typeof guard
export function setRuleMessage<T>(prepend: string, guard: TypeGuard<T>, rules?: DefaultRules[]) {
    const message = getRuleMessages(rules ?? []).join(' & ')

    if (getRule('String.nonEmpty')(message)) return setMessage(`${prepend} & ${message}`, guard)

    return setMessage(prepend, guard)
}
