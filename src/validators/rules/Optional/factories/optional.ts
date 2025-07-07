import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const optional: RuleFactory<'optional'> = () => [keys['optional'], []]
