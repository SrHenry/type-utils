import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const optional: RuleFactory<'optional'> = () => [keys['optional'], []]
