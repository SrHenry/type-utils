import { nonZero } from '../../common'

const handler = (arg: string) => nonZero(String(arg).length)

export { handler as nonEmpty }
