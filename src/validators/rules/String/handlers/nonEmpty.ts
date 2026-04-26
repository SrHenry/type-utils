import { nonZero } from '../../common.ts'

const handler = (arg: string) => nonZero(String(arg).length)

export { handler as nonEmpty }
