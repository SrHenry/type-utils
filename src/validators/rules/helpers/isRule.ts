import { All } from '../types'

export function isRule(rule: unknown): rule is All {
    if (!Array.isArray(rule)) return false

    const [r, args, handler] = rule

    if (typeof r !== 'string') return false
    if (!Array.isArray(args)) return false

    if (!!handler && typeof handler !== 'function') return false

    return true
}
