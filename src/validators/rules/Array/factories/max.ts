import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const max: RuleFactory<'Array.max'> = n => [keys['Array.max'], [n]]
