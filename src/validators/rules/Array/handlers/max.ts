import { max } from '../../common'

const handler = (arg: unknown[], n: number | bigint) => Array.isArray(arg) && max(arg.length, n)

export { handler as max }
