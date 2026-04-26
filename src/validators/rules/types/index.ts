import type { MessageFormator } from '../../../TypeGuards/types/index.ts'
import type { ArrayRule } from './../Array/index.ts'
import type { NumberRule } from './../Number/index.ts'
import type { RecordRule } from './../Record/index.ts'
import type { StringRule } from './../String/index.ts'
import type { RuleTuple } from './RuleTuple.ts'

export type * from './RuleFactory.ts'
export type * from './RuleTuple.ts'

export type Rule<Subject = any, Args extends any[] = any[]> = (
    subject: Subject,
    ...args: Args
) => boolean

export type CustomHandler<Args extends any[] = any[], Subject = any> = (
    subject: Subject
) => (...args: Args) => boolean

export type Custom<
    Args extends any[] = unknown[],
    RuleName extends string = string,
    Subject = unknown
> = [rule: RuleName, args: Args, handler: CustomHandler<Args, Subject>]

export type GetCustomRuleName<CustomRule extends Custom> = CustomRule[0]
export type GetCustomRuleArgs<CustomRule extends Custom> = CustomRule[1]
export type GetCustomRuleHandler<CustomRule extends Custom> = CustomRule[2]

export type CustomFactory<
    Args extends any[] = unknown[],
    RuleName extends string = string,
    Subject = unknown
> = (...args: Args) => Custom<Args, RuleName, Subject>

export type Default = StringRule | NumberRule | ArrayRule | RecordRule
export type All<
    Args extends any[] = unknown[],
    RuleName extends string = string,
    Subject = unknown
> = Default | Custom<Args, RuleName, Subject>

export type CreateRuleArgs<
    RName extends string = string,
    Handler extends CustomHandler = CustomHandler,
    Message extends string = string,
    Formator extends MessageFormator = MessageFormator
> = {
    name: RName
    message?: Message
    messageFormator?: Formator
    handler: Handler
}

export type NoArgs = []

export type RuleStruct<Rule> = Rule extends RuleTuple<infer RuleName>
    ? {
          type: 'default'

          rule: RuleName
          args: Rule[1]
      }
    : Rule extends Custom<[...infer Args], infer RuleName, infer Subject>
    ? {
          type: 'custom'

          rule: RuleName
          args: Args
          handler: CustomHandler<Args, Subject>
      }
    : never
