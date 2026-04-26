import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

export const url: RuleFactory<'String.url'> = () => [keys['String.url'], []]
