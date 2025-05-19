import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const url: RuleFactory<'String.url'> = () => [keys['String.url'], []]
