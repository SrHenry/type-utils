import { ensureInstanceOf, ensureInterface, is, TypeGuard } from '../TypeGuards/GenericTypeGuards'
import { TypeGuardError } from '../TypeGuards/TypeErrors'
import { ValidatorArgs } from './Validators'

export abstract class BaseValidator {
    public static validateProperties<T, U>(
        arg: T,
        { validators, required = [], optional = [] }: ValidatorArgs<U>
    ): U {
        const o = ensureInstanceOf(arg, Object) as Record<string, unknown>

        if (required.length === 0 && optional.length === 0) {
            for (const [prop, validator] of Object.entries<TypeGuard>(validators)) {
                if (!(prop in o)) throw new TypeGuardError(`Property ${prop} is not defined`, o)

                if (!validator(o[prop]))
                    throw new TypeGuardError(
                        `Property '${prop}' failed validation`,
                        o[prop],
                        validator
                    )
            }

            return o as U
        }

        for (const key of required) {
            if (!(key in o))
                throw new TypeGuardError(`Missing required key ${key}`, o, validators[key])

            if (!validators[key](o[key as keyof typeof o]))
                throw new TypeGuardError(
                    `Invalid value for key ${key}`,
                    o[key as keyof typeof o],
                    validators[key]
                )
        }
        for (const key of optional) {
            if (key in o) {
                if (!validators[key](o[key as keyof typeof o]))
                    throw new TypeGuardError(
                        `Invalid value for key ${key}`,
                        o[key as keyof typeof o],
                        validators[key]
                    )
            }
        }

        return o as U
    }

    public static hasValidProperties<T>(arg: unknown, vargs: ValidatorArgs<T>): arg is T {
        try {
            this.validateProperties(arg, vargs)

            return true
        } catch {
            return false
        }
    }

    public static validatePropertiesAsync<T, U>(
        arg: T,
        { validators, required = [], optional = [] }: ValidatorArgs<U>
    ): Promise<U> {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.validateProperties(arg, { validators, required, optional }))
            } catch (e: unknown) {
                reject(e)
            }
        })
    }

    public static isValidArray<T>(arg: unknown, args: ValidatorArgs<T>): arg is Array<T> {
        try {
            this.validateArray(arg, args)

            return true
        } catch {
            return false
        }
    }

    public static validateArray<T, U>(arg: T, args: ValidatorArgs<U>): U[] {
        if (!Array.isArray(arg)) throw new TypeGuardError(`Invalid type for array`, arg, Array)

        for (const item of arg) {
            this.validateProperties(item, args)
        }

        return arg as U[]
    }

    public static extractWithFallback<T, U>(arg: T, args: ValidatorArgs<U>): U | undefined
    public static extractWithFallback<T, U>(arg: T, args: ValidatorArgs<U>, defaultValue: U): U
    public static extractWithFallback<T, U>(arg: T, args: TypeGuard<U>, defaultValue: U): U
    public static extractWithFallback<T, U>(arg: T, args: TypeGuard<U>): U | undefined

    public static extractWithFallback<T, U>(
        arg: T,
        args: ValidatorArgs<U> | TypeGuard<U>,
        defaultValue: U | undefined = undefined
    ): U | undefined {
        if (typeof args === 'function') return is(arg, args) ? arg : defaultValue ?? void 0
        return this.hasValidProperties(arg, args) ? arg : defaultValue ?? void 0
    }

    public static validate<T, U>(arg: T, schema: TypeGuard<U>): U {
        return ensureInterface(arg, schema)
    }

    public static isValid<T>(arg: unknown, schema: TypeGuard<T>): arg is T {
        return schema(arg)
    }
}
