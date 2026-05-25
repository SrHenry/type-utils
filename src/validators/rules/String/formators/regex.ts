import { template } from '../../common.ts'

export const regexFormator = (regex: RegExp): string => template(`matches ${regex}`)
