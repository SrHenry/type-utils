import { ArrayRule, ArrayRules } from './Array'
import * as helpers from './helpers'
import { NumberRule, NumberRules } from './Number'
import { OptionalRule, OptionalRules } from './Optional'
import { RecordRule, RecordRules } from './Record'
import { StringRule, StringRules } from './String'

export * from './helpers'
export * from './types'

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
