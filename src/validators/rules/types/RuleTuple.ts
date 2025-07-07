import { OmitFirstItemFromTuple } from '../../../types/Tuple'
import { bindings, keys } from '../constants'

export type RuleTuple<Rule extends keyof keys = keyof keys> = [
    rule: keys[Rule],
    args: OmitFirstItemFromTuple<Parameters<bindings[keys[Rule]]>>
]
