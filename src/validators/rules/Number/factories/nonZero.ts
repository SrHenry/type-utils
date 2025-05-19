import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const nonZero: RuleFactory<'Number.nonZero'> = () => [keys['Number.nonZero'], []]
