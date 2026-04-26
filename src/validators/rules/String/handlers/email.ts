import { Email } from '../../../../classes/Email.ts'

const handler = (arg: string) => Email.validate(String(arg))

export { handler as email }
