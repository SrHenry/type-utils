import type { TypeGuard } from '../../../TypeGuards/types/index.ts'
import type { Custom as CustomRules, Default as DefaultRules } from '../../rules/types/index.ts'

import { setMessage } from '../../../TypeGuards/helpers/setMessage.ts'
import { getRule } from '../../rules/helpers/getRule.ts'
import { getRuleMessages } from './getRuleMessages.ts'

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
