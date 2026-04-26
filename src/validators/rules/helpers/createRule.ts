import type { MessageFormator } from '../../../TypeGuards/types/index.ts'
import type { Factory, Param0 } from '../../../types/Func.ts'
import type {
    CreateRuleArgs,
    Custom,
    CustomFactory,
    CustomHandler,
    GetCustomRuleHandler,
    GetCustomRuleName,
} from '../types/index.ts'
import { getRuleSetterForCustomHandler } from './getRuleSetterForCustomHandler.ts'

export function createRule<
    Handler extends CustomHandler,
    RName extends string = string,
    Message extends string = string,
    Formator extends MessageFormator = MessageFormator
>({
    name,
    message,
    messageFormator,
    handler,
}: CreateRuleArgs<RName, Handler, Message, Formator>): CustomFactory<
    Parameters<ReturnType<Handler>>,
    RName,
    Param0<Handler>
>
export function createRule<
    CustomRule extends Custom<any[], string, any>,
    Message extends string = string,
    Formator extends MessageFormator = MessageFormator,
    RuleName extends string = GetCustomRuleName<CustomRule>,
    Handler extends CustomHandler = GetCustomRuleHandler<CustomRule>
>({
    name,
    message,
    messageFormator,
    handler,
}: CreateRuleArgs<RuleName, Handler, Message, Formator>): Factory<
    Parameters<ReturnType<Handler>>,
    CustomRule
>

export function createRule<
    Handler extends CustomHandler,
    RName extends string = string,
    Message extends string = string,
    Formator extends MessageFormator = MessageFormator
>({
    name,
    message,
    messageFormator,
    handler,
}: CreateRuleArgs<RName, Handler, Message, Formator>): CustomFactory<
    Parameters<ReturnType<Handler>>,
    RName,
    Param0<Handler>
> {
    type Args = Parameters<ReturnType<Handler>>
    type Subject = Param0<Handler>

    const wrapper = (subject: Subject) => {
        const getSetterWithSubject = getRuleSetterForCustomHandler(handler)

        if (!!messageFormator)
            return getSetterWithSubject(subject).setErrorMessageFormator(messageFormator)
        if (!!message) return getSetterWithSubject(subject).setErrorMessage(message)

        return handler(subject)
    }

    return (...args: Args) => [name, args, wrapper]
}
