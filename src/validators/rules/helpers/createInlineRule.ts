import type { Fn } from '../../../types/Func.ts'
import type { Custom } from '../types/index.ts'
import { createRule } from './createRule.ts'
import { createRuleHandler } from './createRuleHandler.ts'

export const InlineRuleName = 'Custom.Rule.<anonymous>' as const
export type InlineRuleName = typeof InlineRuleName

export function createInlineRule<TSubject, TRuleName extends string>(
  name: TRuleName,
  predicate: Fn<[subject: TSubject], boolean>
): Custom<[], TRuleName, TSubject>
export function createInlineRule<TSubject>(
  name: string,
  predicate: Fn<[subject: TSubject], boolean>
): Custom<[], string, TSubject>
export function createInlineRule<TSubject>(
  predicate: Fn<[subject: TSubject], boolean>
): Custom<[], InlineRuleName, TSubject>

export function createInlineRule<TSubject>(
  ...args:
    | [predicate: Fn<[subject: TSubject], boolean>]
    | [name: string, predicate: Fn<[subject: TSubject], boolean>]
): Custom<[], string | InlineRuleName, TSubject> {
  if (args.length === 1) {
    return createRule({
      name: InlineRuleName,
      handler: createRuleHandler(args[0]),
    })()
  }

  return createRule({
    name: args[0],
    handler: createRuleHandler(args[1]),
  })()
}
