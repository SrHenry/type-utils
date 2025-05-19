import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const optional: RuleFactory<'optional'> = () => [keys['optional'], []]
