export class TypeGuardError<Type, TypeGuard> extends Error {
    private __checked: Type
    private __against?: TypeGuard

    constructor(message: string, checked: Type, against?: TypeGuard) {
        super(message)
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
            ...this,
            checked: this.checked,
            against: this.against,
        }
    }
}

