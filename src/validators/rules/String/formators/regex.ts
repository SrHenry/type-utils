import { template } from '../../common.ts'

export const regexFormator = (regex: RegExp) => template(`matches ${regex}`)
