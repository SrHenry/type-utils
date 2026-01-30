import { keys } from '../../rules/constants'
import { isCustom } from '../../rules/helpers/isCustomRule'
import { isDefaultRule } from '../../rules/helpers/isDefaultRule'

import {
    Custom as CustomRuleSet,
    Default as DefaultRuleSet,
    All as RuleSet,
    RuleStruct,
} from '../../rules/types'

export function getRuleStructMetadata<Rule extends RuleSet<any[], string, any>>(
    rule: Rule
): RuleStruct<Rule>
export function getRuleStructMetadata(rule: CustomRuleSet): RuleStruct<CustomRuleSet>
export function getRuleStructMetadata(rule: DefaultRuleSet): RuleStruct<DefaultRuleSet>
export function getRuleStructMetadata(rule: RuleSet): RuleStruct<RuleSet>

export function getRuleStructMetadata(rule: RuleSet): RuleStruct<RuleSet> {
    if (isDefaultRule(rule)) {
        const [binding, args] = rule
        const [name] = Object.entries(keys).find(([, value]) => value === binding)!

        return {
            type: 'default',
            rule: name,
            args: args,
        } as RuleStruct<DefaultRuleSet>
    }

    if (isCustom(rule)) {
        const [name, args, handler] = rule
        return { type: 'custom', rule: name, args, handler } as RuleStruct<
            CustomRuleSet<any[], string, any>
        >
    }

    throw new Error('Invalid rule')
}
