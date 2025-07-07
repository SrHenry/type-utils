import { nonZero } from '../../common'

const handler = (arg: string) => nonZero(arg.length)

export { handler as nonEmpty }
