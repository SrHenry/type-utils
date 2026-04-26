import { optional } from '../Optional/factories/optional.ts'
import { email } from './factories/email.ts'
import { max } from './factories/max.ts'
import { min } from './factories/min.ts'
import { nonEmpty } from './factories/nonEmpty.ts'
import { regex } from './factories/regex.ts'
import { url } from './factories/url.ts'

export const StringRules = {
    min,
    max,
    regex,
    nonEmpty,
    email,
    url,
    optional,
} as const

export { email, max, min, nonEmpty, optional, regex, url }

export type StringRule = ReturnType<(typeof StringRules)[keyof typeof StringRules]>
