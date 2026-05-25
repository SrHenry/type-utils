import { max } from '../../common.ts'

// biome-ignore lint/nursery/noUselessTypeConversion: String() guards against undefined at runtime
const handler = (arg: string, n: number | bigint): boolean => max(String(arg).length, n)

export { handler as max }
