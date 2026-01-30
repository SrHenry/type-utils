import type { bindings, keys } from '../../../rules/constants'
import { getRule } from '../../../rules/helpers/getRule'
import { isCustom as isCustomRule } from '../../../rules/helpers/isCustomRule'
import type {
    Custom as CustomRules,
    Default as DefaultRules,
    RuleTuple as DefaultRuleTuple,
} from '../../../rules/types'

type DefaultMappedRule<R extends keyof keys = keyof keys> = {
    type: 'default'

    rule: bindings[keys[R]]
    args: Parameters<bindings[keys[R]]>
}
type CustomMappedRule<
    Args extends any[] = unknown[],
    RuleName extends string = string,
    Subject = unknown
> = {
    type: 'custom'

    rule: CustomRules<Args, RuleName, Subject>[2]
    args: CustomRules<Args, RuleName, Subject>[1]
}

export type MappedRules = DefaultMappedRule | CustomMappedRule

export function mapDefaultOrCustomRules<T extends keyof keys>(
    ruleTuple: DefaultRuleTuple<T>
): DefaultMappedRule<T>

export function mapDefaultOrCustomRules(ruleTuple: DefaultRules): MappedRules

export function mapDefaultOrCustomRules<
    Args extends any[] = unknown[],
    RuleName extends string = string,
    Subject = unknown
>(ruleTuple: CustomRules<Args, RuleName, Subject>): CustomMappedRule<Args, RuleName, Subject>

export function mapDefaultOrCustomRules(ruleTuple: CustomRules): CustomMappedRule

export function mapDefaultOrCustomRules(ruleTuple: DefaultRules | CustomRules): MappedRules

export function mapDefaultOrCustomRules(ruleTuple: DefaultRules | CustomRules): MappedRules {
    const [, args] = ruleTuple

    if (isCustomRule(ruleTuple)) {
        const [, , handler] = ruleTuple
        return { rule: handler(void 0), args, type: 'custom' } as unknown as CustomMappedRule
    }

    const [ruleBinding] = ruleTuple
    return { rule: getRule(ruleBinding), args, type: 'default' } as DefaultMappedRule
}

export default mapDefaultOrCustomRules
