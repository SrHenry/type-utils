import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const email: RuleFactory<'String.email'> = () => [keys['String.email'], []]
