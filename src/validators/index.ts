// export * from "./GenericValidator"
export * as Validators from './Validators'
export { BaseValidator } from './BaseValidator'
import { SchemaValidator } from './SchemaValidator'

export namespace Experimental {
    export const { validate } = SchemaValidator
    export class Validator<T> extends SchemaValidator<T> {}
    // export { SchemaValidator }
}

export * from './Rules'
export * from './Schema'
