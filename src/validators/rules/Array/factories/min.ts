import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const min: RuleFactory<'Array.min'> = n => [keys['Array.min'], [n]]
