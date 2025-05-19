import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const email: RuleFactory<'String.email'> = () => [keys['String.email'], []]
