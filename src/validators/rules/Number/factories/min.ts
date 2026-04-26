import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const min: RuleFactory<'Number.min'> = n => [keys['Number.min'], [n]]
