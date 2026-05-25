import { nonZero } from '../../common.ts'

const handler = (arg: number): boolean => nonZero(arg)

export { handler as nonZero }
