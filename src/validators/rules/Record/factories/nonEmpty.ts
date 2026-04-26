import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const nonEmpty: RuleFactory<'Record.nonEmpty'> = () => [keys['Record.nonEmpty'], []]
