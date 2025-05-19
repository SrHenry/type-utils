import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const regex: RuleFactory<'String.regex'> = regex => [keys['String.regex'], [regex]]
