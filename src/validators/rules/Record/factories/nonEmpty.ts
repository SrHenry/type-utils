import { keys } from '../../constants'
import { RuleFactory } from '../../index'

export const nonEmpty: RuleFactory<'Record.nonEmpty'> = () => [keys['Record.nonEmpty'], []]
