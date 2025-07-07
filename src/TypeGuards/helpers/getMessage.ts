import { __message__ } from './constants'
import { getMetadata } from './getMetadata'

export const getMessage = <T>(arg: T): string => getMetadata(__message__, arg) ?? ''
