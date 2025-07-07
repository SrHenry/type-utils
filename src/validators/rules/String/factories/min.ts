import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const min: RuleFactory<'String.min'> = n => [keys['String.min'], [n < 0 ? 0 : n]]
