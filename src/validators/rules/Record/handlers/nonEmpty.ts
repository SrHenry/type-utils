import { nonZero } from '../../common'

const handler = (arg: Record<keyof any, unknown>) => nonZero(Object.keys(arg).length)

export { handler as nonEmpty }
