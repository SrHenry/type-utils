import type { RuleFactory } from '../../types/RuleFactory'

import { keys } from '../../constants'

type UniqueArgs = [deepObject: boolean] | []

export const unique: RuleFactory<'Array.unique', UniqueArgs> = (deepObject: boolean = true) => [
    keys['Array.unique'],
    [deepObject],
]

unique()
