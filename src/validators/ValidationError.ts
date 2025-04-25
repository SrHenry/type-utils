import {
    getValidatorMessageFormator,
    setValidatorMessageFormator,
    TypeGuard,
    TypeGuardError,
} from '../TypeGuards'

export type ValidationArgs<
    Value,
    Schema,
    Name extends string = string,
    Parent = any,
    Context extends {} | null = null
> = {
    value: Value
    schema: TypeGuard<Schema>
    message: string
    name?: Name
    parent?: Parent
    context?: Context
}

const defaultMessageFormator = (path: string, message: string) => `[${path}] - ${message}`

export class ValidationError<
    Value,
    Schema,
    Path extends string = string,
    Parent = any,
    Context extends {} = any
> extends TypeGuardError<Value, TypeGuard<Schema>> {
    private Path?: Path
    private Parent?: Parent
    public readonly context: Context | null = null

    constructor({
        message,
        schema,
        value,
        name,
        parent,
        context,
    }: ValidationArgs<Value, Schema, Path, Parent, Context>) {
        super(message, value, schema)

        this.Path = name
        this.Parent = parent

        if (context) this.context = context

        setValidatorMessageFormator(defaultMessageFormator, this)
    }

    public get path(): Path | undefined {
        return this.Path
    }

    public get parent(): Parent | undefined {
        return this.Parent
    }

    public override toJSON() {
        return {
            ...this,
            ...super.toJSON(),
            path: this.path,
            parent: this.parent,
        }
    }

    public override toString() {
        const format = getValidatorMessageFormator(this) ?? defaultMessageFormator

        return format(this.path ?? '$', this.message)
    }

    public toPrimitive(hint: TypeOfTag) {
        if (hint === 'string') return this.toString()

        return
    }
}

export class ValidationErrors<
    T extends ValidationError<any, any>[] = ValidationError<unknown, unknown>[]
> {
    public constructor(public readonly errors: T) {}

    [Symbol.iterator]() {
        return this.errors[Symbol.iterator]()
    }

    toJSON() {
        return this.errors.map(e => e?.toJSON() ?? e)
    }

    toString() {
        return this.errors.map(e => e?.toString() ?? e).join('\n')
    }

    toPrimitive(hint: TypeOfTag) {
        if (hint === 'string') return this.toString()

        return
    }
}

export default ValidationError
