import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

type StrictArgs = [allowedKeys: string[]]

export const strict: RuleFactory<'Object.strict', StrictArgs> = allowedKeys => [
    keys['Object.strict'],
    [allowedKeys],
]
