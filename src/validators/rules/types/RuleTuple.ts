import type { OmitFirstItemFromTuple } from '../../../types/Tuple.ts'
import type { bindings, keys } from '../constants.ts'

export type RuleTuple<Rule extends keyof keys = keyof keys> = [
    rule: keys[Rule],
    args: OmitFirstItemFromTuple<Parameters<bindings[keys[Rule]]>>,
]
