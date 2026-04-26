import { max } from '../../common.ts'

const handler = (arg: number | bigint, n: number | bigint) => max(Number(arg), n)

export { handler as max }
