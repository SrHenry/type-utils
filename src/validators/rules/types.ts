import { Func } from '../../types/Func'
import type { ArrayRules } from './Array'
import type { bindings, keys } from './constants'
import type { NumberRules } from './Number'
import type { RecordRules } from './Record'
import type { StringRules } from './String'

export type MessageFormator = (...args: any[]) => string

export type Rule<Arg = any, Args = any> = (arg: Arg, ...args: Args[]) => boolean

export type OmitFirstItemFromTuple<T extends any[]> = T extends [any, ...infer rest]
    ? [...rest]
    : never

export type RuleTuple<Rule extends keyof keys = keyof keys> = [
    rule: keys[Rule],
    args: OmitFirstItemFromTuple<Parameters<bindings[keys[Rule]]>>
]

export type CustomHandler<Args extends any[] = any[], Subject = any> = (
    subject: Subject
) => (...args: Args) => boolean

export type Custom<
    Args extends any[] = unknown[],
    RuleName extends string = string,
    Subject = unknown
> = [rule: RuleName, args: Args, handler: CustomHandler<Args, Subject>]

export type CustomFactory<
    Args extends any[] = unknown[],
    RuleName extends string = string,
    Subject = unknown
> = (...args: Args) => Custom<Args, RuleName, Subject>

export type Default = StringRules | NumberRules | ArrayRules | RecordRules
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

export type RuleFactory<
    RuleName extends keyof keys = keyof keys,
    Args extends any[] = RuleTuple<RuleName>[1]
> = Func<Args, RuleTuple<RuleName>>

export type NoArgs = []
