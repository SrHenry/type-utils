import type { MessageFormator } from '../../../../TypeGuards/types/index.ts'
import type { bindings, keys } from '../../../rules/constants.ts'
import type { CustomHandler } from '../../../rules/types/index.ts'
import { getRule } from '../../../rules/helpers/getRule.ts'
import { isCustom as isCustomRule } from '../../../rules/helpers/isCustomRule.ts'
import type {
    Custom as CustomRules,
    Default as DefaultRules,
    RuleTuple as DefaultRuleTuple,
} from '../../../rules/types/index.ts'

type DefaultMappedRule<R extends keyof keys = keyof keys> = {
    type: 'default'

    rule: bindings[keys[R]]
    args: Parameters<bindings[keys[R]]>
}
type CustomMappedRule<
    Args extends any[] = unknown[],
    RuleName extends string = string,
    Subject = unknown,
> = {
    type: 'custom'

    rule: RuleName
    args: CustomRules<Args, RuleName, Subject>[1]
    handler: CustomHandler<Args, Subject>
    formator: MessageFormator
}

export type MappedRules = DefaultMappedRule | CustomMappedRule

export function mapDefaultOrCustomRules<T extends keyof keys>(
    ruleTuple: DefaultRuleTuple<T>
): DefaultMappedRule<T>

export function mapDefaultOrCustomRules(ruleTuple: DefaultRules): MappedRules

export function mapDefaultOrCustomRules<
    Args extends any[] = unknown[],
    RuleName extends string = string,
    Subject = unknown,
>(ruleTuple: CustomRules<Args, RuleName, Subject>): CustomMappedRule<Args, RuleName, Subject>

export function mapDefaultOrCustomRules(ruleTuple: CustomRules): CustomMappedRule

export function mapDefaultOrCustomRules(ruleTuple: DefaultRules | CustomRules): MappedRules

export function mapDefaultOrCustomRules(ruleTuple: DefaultRules | CustomRules): MappedRules {
    if (isCustomRule(ruleTuple)) {
        const [name, args, handler, formator] = ruleTuple
        return { rule: name, args, handler, formator, type: 'custom' } as CustomMappedRule
    }

    const [ruleBinding, args] = ruleTuple
    return { rule: getRule(ruleBinding), args, type: 'default' } as DefaultMappedRule
}

export default mapDefaultOrCustomRules
