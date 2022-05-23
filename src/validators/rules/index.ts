import { ArrayRules } from './Array'
import { NumberRules } from './Number'
import { StringRules } from './String'
import { Optional } from './optional'
import * as helpers from './helpers'

export * from './types'
export * from './helpers'

export { ArrayRules, NumberRules, StringRules, Optional }

export const Rules = {
    Array: ArrayRules,
    Number: NumberRules,
    String: StringRules,
    Optional,
    ...helpers,
}

export default Rules
