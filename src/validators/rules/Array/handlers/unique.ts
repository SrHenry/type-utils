import { unique } from '../../common.ts'

const handler = (arg: unknown[], deepObject = true) => Array.isArray(arg) && unique(arg, deepObject)

export { handler as unique }
