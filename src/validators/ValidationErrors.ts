import type ValidationError from './ValidationError'

import { createDefaultGenerator } from '../helpers/createDefaultGenerator'
import { getIterableObjectOrDefault } from '../helpers/getIterableObjectOrDefault'
import { stringifyErrors } from './helpers/stringifyErrors'

export class ValidationErrors<
    T extends ValidationError<any, any> = ValidationError<unknown, unknown>,
> extends Error {
    readonly #generator: IterableIterator<T>
    readonly #errors: T[]

    public constructor(errors: T[])
    public constructor(generator: IterableIterator<T>)
    public constructor(iterator: Iterator<T>)

    public constructor(errors: Iterator<T> | IterableIterator<T> | T[]) {
        if (!Array.isArray(errors)) {
            super()

            this.#errors = new Array()
            this.#generator = getIterableObjectOrDefault(errors)

            return
        }

        super(stringifyErrors(errors))

        this.#generator = createDefaultGenerator()
        this.#errors = errors
    }

    public get errors(): T[] {
        Array.from(this.#generator).forEach(error => this.#errors.push(error))

        return this.#errors
    }

    public [Symbol.iterator](): ArrayIterator<T> {
        return this.errors[Symbol.iterator]()
    }

    public toJSON() {
        return this.errors.map(e => e.toJSON())
    }
    public override toString(): string {
        return stringifyErrors(this.errors)
    }
    public toPrimitive(hint: TypeOfTag): string | void {
        if (hint === 'string') return this.toString()
    }
}
