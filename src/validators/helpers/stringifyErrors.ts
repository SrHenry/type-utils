import { ValidationError } from '../ValidationError'

export const stringifyErrors = <TValue, TSchema>(errors: ValidationError<TValue, TSchema>[]) =>
    errors.map(e => e?.toString() ?? e).join('\n')
