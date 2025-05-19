import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const max: RuleFactory<'Number.max'> = n => [keys['Number.max'], [n]]
