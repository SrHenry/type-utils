import { min } from '../../common'

const handler = (arg: unknown[], n: number | bigint) => min(arg.length, n)

export { handler as min }
