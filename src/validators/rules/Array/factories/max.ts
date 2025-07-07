import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const max: RuleFactory<'Array.max'> = n => [keys['Array.max'], [n]]
