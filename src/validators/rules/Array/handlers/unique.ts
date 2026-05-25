import { unique } from '../../common.ts'

const handler = (arg: unknown[], deepObject = true): boolean =>
    Array.isArray(arg) && unique(arg, deepObject)

export { handler as unique }
