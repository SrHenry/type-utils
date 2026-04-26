import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const min: RuleFactory<'String.min'> = n => [keys['String.min'], [n < 0 ? 0 : n]]
