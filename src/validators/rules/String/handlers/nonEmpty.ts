import { nonZero } from '../../common.ts'

// biome-ignore lint/nursery/noUselessTypeConversion: String() guards against undefined at runtime
const handler = (arg: string) => nonZero(String(arg).length)

export { handler as nonEmpty }
