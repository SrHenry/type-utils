import { ArrayRules } from './Array'
import * as helpers from './helpers'
import { NumberRules } from './Number'
import { OptionalRules } from './Optional'
import { RecordRules } from './Record'
import { StringRules } from './String'

export * from './helpers'
export * from './types'

export { ArrayRules, NumberRules, OptionalRules, RecordRules, StringRules }

export const Rules = {
    Array: ArrayRules,
    Number: NumberRules,
    String: StringRules,
    Record: RecordRules,
    Optional: OptionalRules,
    ...helpers,
}

export default Rules
