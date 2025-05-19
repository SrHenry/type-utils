import { min } from '../../common'

const handler = (arg: string, n: number | bigint) => min(arg.length, n)

export { handler as min }
