import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const nonZero: RuleFactory<'Number.nonZero'> = () => [keys['Number.nonZero'], []]
