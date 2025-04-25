import { ArrayRules } from './Array'
import { NumberRules } from './Number'
import { RecordRules } from './Record'
import { StringRules } from './String'
import * as helpers from './helpers'
import { Optional } from './optional'

export * from './helpers'
export * from './types'

export { ArrayRules, NumberRules, Optional, RecordRules, StringRules }

export const Rules = {
    Array: ArrayRules,
    Number: NumberRules,
    String: StringRules,
    Record: RecordRules,
    Optional,
    ...helpers,
}

export default Rules
