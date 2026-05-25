import { max } from '../../common.ts'

const handler = (arg: unknown[], n: number | bigint): boolean =>
    Array.isArray(arg) && max(arg.length, n)

export { handler as max }
