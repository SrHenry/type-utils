import { unique } from '../../common'

const handler = (arg: unknown[], deepObject: boolean = true) => unique(arg, deepObject)

export { handler as unique }
