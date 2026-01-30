import { NonEnumerableProperty } from '../helpers/decorators/stage-2'

const NO_CAUSE = Symbol('TypeGuardError::NO_CAUSE')

export class TypeGuardError<Type, TypeGuard> extends Error {
    @NonEnumerableProperty()
    private readonly __checked: Type
    @NonEnumerableProperty()
    private readonly __against?: TypeGuard

    constructor(message: string, checked: Type)
    constructor(message: string, checked: Type, against: TypeGuard)
    constructor(message: string, checked: Type, against: TypeGuard, cause: Error['cause'])

    constructor(
        message: string,
        checked: Type,
        against?: TypeGuard,
        cause: Error['cause'] = NO_CAUSE
    ) {
        super(message, cause === NO_CAUSE ? undefined : { cause })

        this.__checked = checked
        this.__against = against
    }

    public get checked() {
        return this.__checked
    }

    public get against() {
        return this.__against
    }

    public toJSON() {
        return {
            name: this.name,
            message: this.message,

            ...('stack' in this ? { stack: this.stack } : {}),
            ...('cause' in this ? { cause: this.cause } : {}),

            checked: this.checked,
            against: this.against,
        }
    }
}
