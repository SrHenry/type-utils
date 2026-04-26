import { nonZero } from '../../common.ts'

const handler = (arg: Record<keyof any, unknown>) => nonZero(Object.keys(arg).length)

export { handler as nonEmpty }
