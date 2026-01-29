import type { Custom as CustomRule, Default as DefaultRules, Rule } from '../../rules/types'

import { AND } from '../../../helpers/logic'
import { getRule } from '../../rules/helpers/getRule'
import { isCustomHandler } from '../../rules/helpers/isCustomHandler'
import { isRule } from '../../rules/helpers/isRule'
import { isRequired } from './isRequired'

export function isFollowingRules<CustomRules extends CustomRule<any[], string, any>[]>(
    arg: unknown,
    // rules: CustomRule<Custom[1], Custom[0]>[]
    rules: CustomRules
): boolean
export function isFollowingRules<Custom extends CustomRule<any[], string, any>>(
    arg: unknown,
    // rules: CustomRule<Custom[1], Custom[0]>[]
    rules: Custom[]
): boolean
export function isFollowingRules<Args extends any[], RuleName extends string>(
    arg: unknown,
    rules: CustomRule<Args, RuleName>[]
): boolean
export function isFollowingRules(arg: unknown, rules: DefaultRules[]): boolean
export function isFollowingRules(arg: unknown, rules: unknown[]): boolean {
    return AND(
        ...rules
            .filter(isRule)
            .filter(isRequired)
            .map(([rule, args, handler]) => {
                if (isCustomHandler(handler)) return handler(arg).call(null, ...args)

                return getRule<DefaultRules[0], Rule>(rule as DefaultRules[0]).call(
                    null,
                    arg,
                    ...args
                )
            })
    )
}
