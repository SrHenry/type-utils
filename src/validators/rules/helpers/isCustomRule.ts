import type { Custom } from '../types/index.ts'
import { CUSTOM_RULE_BRAND as BRAND } from '../types/index.ts'
import { isRule } from './isRule.ts'

export const isCustom = <
    Args extends any[] = unknown[],
    RuleName extends string = string,
    Subject = unknown,
>(
    arg: unknown
): arg is Custom<Args, RuleName, Subject> => {
    if (!isRule(arg)) return false

    const [, , handler] = arg

    if (typeof handler !== 'function') return false
    if (handler.length > 1) return false
    if (!(BRAND in arg) || (arg as any)[BRAND] !== true) return false

    return true
}
