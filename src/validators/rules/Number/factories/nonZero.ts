import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const nonZero: RuleFactory<'Number.nonZero'> = () => [keys['Number.nonZero'], []]
