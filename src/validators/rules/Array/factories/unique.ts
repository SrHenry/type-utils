import { keys } from '../../constants'
import { RuleFactory } from '../../index'

type UniqueArgs = [deepObject: boolean] | []

export const unique: RuleFactory<'Array.unique', UniqueArgs> = (deepObject: boolean = true) => [
    keys['Array.unique'],
    [deepObject],
]

unique()
