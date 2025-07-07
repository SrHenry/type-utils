import { hasMetadata } from '../../../TypeGuards/helpers/hasMetadata'
import { setMetadata } from '../../../TypeGuards/helpers/setMetadata'
import { __optional__ } from './constants'

export const hasOptionalFlag = <T>(subject: T) => hasMetadata(__optional__, subject)
export const setOptionalFlag = <T>(subject: T) => setMetadata(__optional__, true, subject)
