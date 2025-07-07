import { optional } from '../Optional/factories/optional'
import { email } from './factories/email'
import { max } from './factories/max'
import { min } from './factories/min'
import { nonEmpty } from './factories/nonEmpty'
import { regex } from './factories/regex'
import { url } from './factories/url'

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
