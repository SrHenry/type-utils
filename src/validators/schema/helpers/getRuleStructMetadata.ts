import { isCustom } from '../../rules/helpers/isCustomRule'
import { isDefaultRule } from '../../rules/helpers/isDefaultRule'

import {
    Custom as CustomRuleSet,
    Default as DefaultRuleSet,
    All as RuleSet,
    RuleStruct,
} from '../../rules/types'

export function getRuleStructMetadata<Rule extends RuleSet>(rule: Rule): RuleStruct<Rule>
export function getRuleStructMetadata(rule: RuleSet): RuleStruct<RuleSet>

export function getRuleStructMetadata(rule: RuleSet): RuleStruct<RuleSet> {
    if (isDefaultRule(rule))
        return {
            type: 'default',
            rule: rule[0],
            args: rule[1],
        } as unknown as RuleStruct<DefaultRuleSet>

    if (isCustom(rule))
        return { type: 'custom', rule: rule[0], args: rule[1], handler: rule[2] } as RuleStruct<
            CustomRuleSet<any[], string, any>
        >

    throw new Error('Invalid rule')
}
