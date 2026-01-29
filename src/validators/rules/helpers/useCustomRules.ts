import type { TypeGuard } from '../../../TypeGuards/types'
import type { Custom } from '../types'

import { getMessage } from '../../../TypeGuards/helpers/getMessage'
import { isTypeGuard } from '../../../TypeGuards/helpers/isTypeGuard'
import { getRuleStructMetadata } from '../../schema/helpers/getRuleStructMetadata'
import { getStructMetadata } from '../../schema/helpers/getStructMetadata'
import { isFollowingRules } from '../../schema/helpers/isFollowingRules'
import { setRuleMessage } from '../../schema/helpers/setRuleMessage'
import { setStructMetadata } from '../../schema/helpers/setStructMetadata'
import { getCustomRuleMessages } from './getCustomRuleMessages'

export function useCustomRules<T, U extends Custom<any[], string, any>>(
    guard: TypeGuard<T>,
    rule: U
): typeof guard
export function useCustomRules<
    T,
    U1 extends Custom<any[], string, any>,
    U2 extends Custom<any[], string, any>
>(guard: TypeGuard<T>, rule: U1, rule2: U2): typeof guard
export function useCustomRules<
    T,
    U1 extends Custom<any[], string, any>,
    U2 extends Custom<any[], string, any>,
    U3 extends Custom<any[], string, any>
>(guard: TypeGuard<T>, rule: U1, rule2: U2, rule3: U3): typeof guard
export function useCustomRules<
    T,
    U1 extends Custom<any[], string, any>,
    U2 extends Custom<any[], string, any>,
    U3 extends Custom<any[], string, any>,
    U4 extends Custom<any[], string, any>
>(guard: TypeGuard<T>, rule: U1, rule2: U2, rule3: U3, rule4: U4): typeof guard
export function useCustomRules<
    T,
    U1 extends Custom<any[], string, any>,
    U2 extends Custom<any[], string, any>,
    U3 extends Custom<any[], string, any>,
    U4 extends Custom<any[], string, any>,
    U5 extends Custom<any[], string, any>
>(guard: TypeGuard<T>, rule: U1, rule2: U2, rule3: U3, rule4: U4, rule5: U5): typeof guard
export function useCustomRules<
    T,
    U1 extends Custom<any[], string, any>,
    U2 extends Custom<any[], string, any>,
    U3 extends Custom<any[], string, any>,
    U4 extends Custom<any[], string, any>,
    U5 extends Custom<any[], string, any>,
    U extends Custom<any[], string, any>
>(
    guard: TypeGuard<T>,
    rule1: U1,
    rule2: U2,
    rule3: U3,
    rule4: U4,
    rule5: U5,
    ...rules: U[]
): typeof guard
export function useCustomRules<T, U extends Custom<any[], string, any>>(
    guard: TypeGuard<T>,
    ...rules: U[]
): typeof guard

export function useCustomRules<T, U extends Custom<any[], string, any>>(
    guard: TypeGuard<T>,
    ...rules: U[]
): typeof guard {
    if (!isTypeGuard(guard)) throw new Error(`\`guard\` is not a predicate`)

    const wrapper = ((subject: unknown) =>
        guard(subject) && isFollowingRules(subject, rules)) as typeof guard

    Object.defineProperty(wrapper, 'name', { value: `useCustomRules::${guard.name}` })

    const metadata = getStructMetadata(guard)
    const message = getMessage(guard)
    const prepend = message.trim().length > 0 ? `${message} & ` : ''

    if (Array.isArray(metadata.rules) && metadata.rules.length > 0)
        for (const struct of rules.map(getRuleStructMetadata<Custom>)) metadata.rules.push(struct)

    return setRuleMessage(
        `${prepend}${getCustomRuleMessages(rules).join(' & ')}`,
        setStructMetadata<T | any>({ ...metadata, schema: wrapper }, wrapper)
    ) as typeof guard
}
