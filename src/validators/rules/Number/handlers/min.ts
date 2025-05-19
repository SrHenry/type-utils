import { min } from '../../common'

const handler = (arg: number | bigint, n: number | bigint) => min(arg, n)

export { handler as min }
