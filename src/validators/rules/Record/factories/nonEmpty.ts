import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const nonEmpty: RuleFactory<'Record.nonEmpty'> = () => [keys['Record.nonEmpty'], []]
