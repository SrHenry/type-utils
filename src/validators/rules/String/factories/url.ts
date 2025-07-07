import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

export const url: RuleFactory<'String.url'> = () => [keys['String.url'], []]
