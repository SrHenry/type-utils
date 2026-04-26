import { min } from '../../common.ts'

const handler = (arg: string, n: number | bigint) => min(String(arg).length, n)

export { handler as min }
