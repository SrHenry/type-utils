import { nonZero } from '../../common'

const handler = (arg: number) => nonZero(Number(arg))

export { handler as nonZero }
