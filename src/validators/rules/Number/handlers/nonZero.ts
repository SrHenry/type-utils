import { nonZero } from '../../common.ts'

const handler = (arg: number) => nonZero(Number(arg))

export { handler as nonZero }
