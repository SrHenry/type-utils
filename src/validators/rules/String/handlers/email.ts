import { Email } from '../../../../classes/Email'

const handler = (arg: string) => Email.validate(arg)

export { handler as email }
