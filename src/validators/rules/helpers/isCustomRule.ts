import type { Custom } from '../types'
import { isCustomHandler } from './isCustomHandler'
import { isRule } from './isRule'

export const isCustom = <
    Args extends any[] = unknown[],
    RuleName extends string = string,
    Subject = unknown
>(
    arg: unknown
): arg is Custom<Args, RuleName, Subject> => {
    if (!isRule(arg)) return false

    const [, , handler] = arg

    if (!handler) return false
    if (!isCustomHandler(handler)) return false

    return true
}
