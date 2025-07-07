import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const regex: RuleFactory<'String.regex'> = regex => [keys['String.regex'], [regex]]
