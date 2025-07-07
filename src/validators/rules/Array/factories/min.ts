import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const min: RuleFactory<'Array.min'> = n => [keys['Array.min'], [n]]
