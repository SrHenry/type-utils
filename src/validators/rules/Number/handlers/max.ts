import { max } from '../../common'

const handler = (arg: number | bigint, n: number | bigint) => max(arg, n)

export { handler as max }
