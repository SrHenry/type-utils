import { min } from '../../common.ts'

const handler = (arg: unknown[], n: number | bigint): boolean =>
    Array.isArray(arg) && min(arg.length, n)

export { handler as min }
