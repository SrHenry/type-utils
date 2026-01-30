import { unique } from '../../common'

const handler = (arg: unknown[], deepObject: boolean = true) =>
    Array.isArray(arg) && unique(arg, deepObject)

export { handler as unique }
