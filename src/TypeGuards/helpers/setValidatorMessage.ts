import { __validator_message__ } from './constants'
import { setMetadata } from './setMetadata'

export const setValidatorMessage = <T>(message: string, arg: T): T =>
    setMetadata(__validator_message__, message, arg)
