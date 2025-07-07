import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const email: RuleFactory<'String.email'> = () => [keys['String.email'], []]
