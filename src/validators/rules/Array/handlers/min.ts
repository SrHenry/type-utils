import { min } from '../../common'

const handler = (arg: unknown[], n: number | bigint) => Array.isArray(arg) && min(arg.length, n)

export { handler as min }
