import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const regex: RuleFactory<'String.regex'> = regex => [keys['String.regex'], [regex]]
