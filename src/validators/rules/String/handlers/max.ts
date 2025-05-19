import { max } from '../../common'

const handler = (arg: string, n: number | bigint) => max(arg.length, n)

export { handler as max }
