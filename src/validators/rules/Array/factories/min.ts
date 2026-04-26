import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const min: RuleFactory<'Array.min'> = n => [keys['Array.min'], [n]]
