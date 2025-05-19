import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const min: RuleFactory<'Number.min'> = n => [keys['Number.min'], [n]]
