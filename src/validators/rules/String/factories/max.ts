import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const max: RuleFactory<'String.max'> = n => [keys['String.max'], [n < 0 ? 0 : n]]
