import { __validator_message__ } from './constants.ts'
import { setMetadata } from './setMetadata.ts'

export const setValidatorMessage = <T>(message: string, arg: T): T =>
    setMetadata(__validator_message__, message, arg)
