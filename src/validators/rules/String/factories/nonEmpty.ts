import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const nonEmpty: RuleFactory<'String.nonEmpty'> = () => [keys['String.nonEmpty'], []]
