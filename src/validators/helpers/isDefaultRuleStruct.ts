import type { All as AllRules, Default as DefaultRule, RuleStruct } from '../rules/types'

export type DefaultRuleStruct = RuleStruct<DefaultRule>

export function isDefaultRuleStruct(
    ruleStruct: RuleStruct<AllRules>
): ruleStruct is DefaultRuleStruct {
    return ruleStruct.type === 'default'
}
