import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

type UniqueArgs = [deepObject: boolean] | []

export const unique: RuleFactory<'Array.unique', UniqueArgs> = (deepObject: boolean = true) => [
    keys['Array.unique'],
    [deepObject],
]
