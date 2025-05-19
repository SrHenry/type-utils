import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const max: RuleFactory<'Array.max'> = n => [keys['Array.max'], [n]]
