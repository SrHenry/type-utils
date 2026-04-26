import type { Custom as CustomRule, Default as DefaultRules, Rule } from '../../rules/types/index.ts'

import { AND } from '../../../helpers/logic/index.ts'
import { getRule } from '../../rules/helpers/getRule.ts'
import { isCustomHandler } from '../../rules/helpers/isCustomHandler.ts'
import { isRule } from '../../rules/helpers/isRule.ts'
import { isRequired } from './isRequired.ts'

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
