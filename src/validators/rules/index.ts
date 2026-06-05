import { ArrayRule, ArrayRules } from './Array/index.ts'
import * as helpers from './helpers/index.ts'
import { NumberRule, NumberRules } from './Number/index.ts'
import { OptionalRule, OptionalRules } from './Optional/index.ts'
import { RecordRule, RecordRules } from './Record/index.ts'
import { StringRule, StringRules } from './String/index.ts'

export * from './helpers/index.ts'

// Explicit allowlist — prevents CUSTOM_RULE_BRAND (runtime internal symbol)
// and RuleStruct (internal dispatch type) from reaching the public API.
// Internal consumers still access these via ./types/index.ts directly.
export type {
    Rule,
    Custom,
    CustomHandler,
    CustomFactory,
    Default,
    All,
    CreateRuleArgs,
    GetCustomRuleName,
    GetCustomRuleArgs,
    GetCustomRuleHandler,
    GetCustomRuleFormator,
    NoArgs,
} from './types/index.ts'
export type * from './types/RuleFactory.ts'
export type * from './types/RuleTuple.ts'

export {
    ArrayRule,
    ArrayRules,
    NumberRule,
    NumberRules,
    OptionalRule,
    OptionalRules,
    RecordRule,
    RecordRules,
    StringRule,
    StringRules,
}

export const Rules = {
    Array: ArrayRules,
    Number: NumberRules,
    String: StringRules,
    Record: RecordRules,
    Optional: OptionalRules,
    ...helpers,
}

export default Rules
