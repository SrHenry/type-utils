import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const max: RuleFactory<'Number.max'> = n => [keys['Number.max'], [n]]
