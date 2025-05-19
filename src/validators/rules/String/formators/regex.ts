import { template } from '../../common'

export const regexFormator = (regex: RegExp) => template(`matches ${regex}`)
