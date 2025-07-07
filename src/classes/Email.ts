type EmailTuple = [username: string, domain: string]

export class Email {
    public static get regex() {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g
    }
    public get value(): string {
        return this.email.join('@')
    }

    private readonly email: EmailTuple

    public get username(): string {
        return this.email[0]
    }
    public get domain(): string {
        return this.email[1] as string
    }

    public constructor(email: string) {
        if (!Email.validate(email)) {
            throw new Error(`Invalid email: ${email}`)
        }

        this.email = email.split('@') as EmailTuple
    }

    public static validate(value: string): boolean {
        return this.regex.test(value)
    }

    [Symbol.toPrimitive](hint: string): string {
        if (hint !== 'string')
            throw new TypeError(`Cannot convert ${this.constructor.name} to ${hint}`)

        return this.value
    }

    public toString(): string {
        return this.value
    }

    public valueOf(): string {
        return this.value
    }
}
