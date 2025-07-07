import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const max: RuleFactory<'String.max'> = n => [keys['String.max'], [n < 0 ? 0 : n]]
