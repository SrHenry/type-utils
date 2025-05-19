import { unique } from '../../common'

const handler = (arg: unknown[], deepObject: boolean) => unique(arg, deepObject)

export { handler as unique }
