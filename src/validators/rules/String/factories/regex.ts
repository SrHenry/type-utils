import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

// biome-ignore lint/nursery/noShadow: callback destructuring — name matches outer scope intentionally
export const regex: RuleFactory<'String.regex'> = regex => [keys['String.regex'], [regex]]
