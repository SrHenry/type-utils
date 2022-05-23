import { TypeOfTag } from 'typescript'
import { TypeGuard, TypeGuardError } from '../TypeGuards'

export type ValidationArgs<Value, Schema, Name extends string = string, Parent = any> = {
    value: Value
    schema: TypeGuard<Schema>
    message: string
    name?: Name
    parent?: Parent
}

export class ValidationError<
    Value,
    Schema,
    Name extends string = string,
    Parent = any
> extends TypeGuardError<Value, TypeGuard<Schema>> {
    private Name?: Name
    private Parent?: Parent

    constructor({
        message,
        schema,
        value,
        name,
        parent,
    }: ValidationArgs<Value, Schema, Name, Parent>) {
        super(message, value, schema)

        this.Name = name
        this.Parent = parent
    }

    public get propName(): Name | undefined {
        return this.Name
    }

    public get parent(): Parent | undefined {
        return this.Parent
    }
}

export class ValidationErrors<T extends ValidationError<any, any>[]> {
    public constructor(public readonly errors: T) {}

    [Symbol.iterator]() {
        return this.errors[Symbol.iterator]()
    }

    toJSON() {
        return this.errors.map(e => e?.toJSON() ?? e)
    }

    toString() {
        return this.errors.map(e => e?.toString() ?? e).join(',')
    }

    toPrimitive(hint: TypeOfTag) {
        switch (hint) {
            case 'string':
                return this.toString()
            default:
                return void 0
        }
    }
}

export default ValidationError
