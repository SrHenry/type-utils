import type { ArrayRules } from './Array'
import type { bindings, keys } from './constants'
import type { NumberRules } from './Number'
import type { RecordRules } from './Record'
import type { StringRules } from './String'

export type MessageFormator = (...args: any[]) => string

export type Rule<Arg = any, Args = any> = (arg: Arg, ...args: Args[]) => boolean

export type OmitFirstItem<T extends any[]> = T extends [any, ...any[]] ? [...T[1]] : never

export type RuleTuple = [
    rule: keys[keyof keys],
    args: OmitFirstItem<Parameters<bindings[keyof bindings]>>
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
