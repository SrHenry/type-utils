import { ArrayRule, ArrayRules } from './Array/index.ts'
import * as helpers from './helpers/index.ts'
import { NumberRule, NumberRules } from './Number/index.ts'
import { OptionalRule, OptionalRules } from './Optional/index.ts'
import { RecordRule, RecordRules } from './Record/index.ts'
import { StringRule, StringRules } from './String/index.ts'

export * from './helpers/index.ts'
export * from './types/index.ts'

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
