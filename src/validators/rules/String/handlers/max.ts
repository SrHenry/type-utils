import { max } from '../../common.ts'

const handler = (arg: string, n: number | bigint) => max(String(arg).length, n)

export { handler as max }
