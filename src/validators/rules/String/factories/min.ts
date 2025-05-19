import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const min: RuleFactory<'String.min'> = n => [keys['String.min'], [n < 0 ? 0 : n]]
