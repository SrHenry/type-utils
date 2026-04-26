import { __message__ } from './constants.ts'
import { getMetadata } from './getMetadata.ts'

export const getMessage = <T>(arg: T): string => getMetadata(__message__, arg) ?? ''
