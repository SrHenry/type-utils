import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const min: RuleFactory<'Number.min'> = n => [keys['Number.min'], [n]]
