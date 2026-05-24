import type { Factory } from '../../../types/Func.ts'
import type { keys } from '../constants.ts'
import type { RuleTuple } from './RuleTuple.ts'

export type RuleFactory<
    RuleName extends keyof keys = keyof keys,
    Args extends any[] = RuleTuple<RuleName>[1],
> = Factory<Args, RuleTuple<RuleName>>
