import { Factory } from '../../../types/Func'
import { keys } from '../constants'
import { RuleTuple } from './RuleTuple'

export type RuleFactory<
    RuleName extends keyof keys = keyof keys,
    Args extends any[] = RuleTuple<RuleName>[1]
> = Factory<Args, RuleTuple<RuleName>>
