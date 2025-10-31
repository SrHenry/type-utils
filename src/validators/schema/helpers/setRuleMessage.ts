import type { TypeGuard } from '../../../TypeGuards/types'
import type { Custom as CustomRules, Default as DefaultRules } from '../../rules/types'

import { setMessage } from '../../../TypeGuards/helpers/setMessage'
import { getRule } from '../../rules/helpers/getRule'
import { getRuleMessages } from './getRuleMessages'

export function setRuleMessage<T>(prepend: string, guard: TypeGuard<T>): typeof guard
export function setRuleMessage<T>(
    prepend: string,
    guard: TypeGuard<T>,
    rules: Array<DefaultRules | CustomRules>
): typeof guard
export function setRuleMessage<T>(
    prepend: string,
    guard: TypeGuard<T>,
    rules?: Array<DefaultRules | CustomRules>
) {
    const message = getRuleMessages(rules ?? []).join(' & ')

    if (getRule('String.nonEmpty')(message)) return setMessage(`${prepend} & ${message}`, guard)

    return setMessage(prepend, guard)
}
