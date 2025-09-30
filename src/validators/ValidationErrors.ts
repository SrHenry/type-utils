import { stringifyErrors } from './helpers/stringifyErrors'
import ValidationError from './ValidationError'

export class ValidationErrors<
    T extends ValidationError<any, any>[] = ValidationError<unknown, unknown>[]
> extends Error {
    public constructor(public readonly errors: T) {
        super(stringifyErrors(errors))
    }

    [Symbol.iterator]() {
        return this.errors[Symbol.iterator]()
    }

    toJSON() {
        return this.errors.map(e => e?.toJSON() ?? e)
    }

    override toString() {
        return stringifyErrors(this.errors)
    }

    toPrimitive(hint: TypeOfTag) {
        if (hint === 'string') return this.toString()

        return
    }
}
