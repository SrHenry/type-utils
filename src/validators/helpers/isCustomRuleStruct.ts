import type { All as AllRules, Custom as CustomRule, RuleStruct } from '../rules/types'

export type CustomRuleStruct = RuleStruct<CustomRule<unknown[], string, unknown>>

export function isCustomRuleStruct(
    ruleStruct: RuleStruct<AllRules>
): ruleStruct is CustomRuleStruct {
    return ruleStruct.type === 'custom'
}
