import { max } from '../../common'

const handler = (arg: unknown[], n: number | bigint) => max(arg.length, n)

export { handler as max }
