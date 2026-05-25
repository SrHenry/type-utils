import { min } from '../../common.ts'

const handler = (arg: number | bigint, n: number | bigint): boolean => min(Number(arg), n)

export { handler as min }
