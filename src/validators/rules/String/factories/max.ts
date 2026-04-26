import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const max: RuleFactory<'String.max'> = n => [keys['String.max'], [n < 0 ? 0 : n]]
