import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const nonEmpty: RuleFactory<'String.nonEmpty'> = () => [keys['String.nonEmpty'], []]
