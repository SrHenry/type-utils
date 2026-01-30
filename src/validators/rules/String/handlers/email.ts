import { Email } from '../../../../classes/Email'

const handler = (arg: string) => Email.validate(String(arg))

export { handler as email }
