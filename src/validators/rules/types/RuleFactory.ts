import { Factory } from '../../../types/Func.ts'
import { keys } from '../constants.ts'
import { RuleTuple } from './RuleTuple.ts'

export type RuleFactory<
    RuleName extends keyof keys = keyof keys,
    Args extends any[] = RuleTuple<RuleName>[1]
> = Factory<Args, RuleTuple<RuleName>>
