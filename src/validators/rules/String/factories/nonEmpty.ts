import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const nonEmpty: RuleFactory<'String.nonEmpty'> = () => [keys['String.nonEmpty'], []]
