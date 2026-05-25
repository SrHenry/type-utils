import { Email } from '../../../../classes/Email.ts'

// biome-ignore lint/nursery/noUselessTypeConversion: String() guards against undefined at runtime
const handler = (arg: string): boolean => Email.validate(String(arg))

export { handler as email }
