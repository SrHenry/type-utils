import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const max: RuleFactory<'Number.max'> = n => [keys['Number.max'], [n]]
