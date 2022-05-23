import { isFunction } from '../../helpers'
import { array, string } from '../schema'
import { keys, bindings } from './constants'
import {
    getMessage,
    getMessageFormator,
    is,
    isTypeGuard,
    setMessageFormator,
    TypeGuard,
} from '../../TypeGuards/GenericTypeGuards'

import type {
    Rule,
    RuleTuple,
    All,
    CustomHandler,
    Custom,
    Default,
    CreateRuleArgs,
    MessageFormator,
    CustomFactory,
} from './types'
import {
    getStructMetadata,
    isFollowingRules,
    setRuleMessage,
    setStructMetadata,
} from '../schema/helpers'

export function getRule<T extends keyof keys>(name: T): bindings[keys[T]]
export function getRule<T extends keyof keys, R extends Rule>(name: T): R

export function getRule<T extends keyof bindings>(key: T): bindings[T]
export function getRule<T extends keyof bindings, R extends Rule>(key: T): R

export function getRule<T extends keyof keys | keyof bindings>(
    name: T
): bindings[keys[keyof keys]] | bindings[keyof bindings] {
    const isRuleName = (str: unknown): str is keyof keys => typeof str === 'string' && str in keys

    const isKeyName = (str: unknown): str is keyof bindings =>
        typeof str === 'string' && str in bindings

    if (is(name, isRuleName)) return bindings[keys[name]]
    else if (is(name, isKeyName)) return bindings[name]

    throw new Error(`Rule not found`)
}

export function parseRule<R extends RuleTuple>([rule]: R): bindings[typeof rule]
export function parseRule([rule]: RuleTuple): bindings[keyof bindings] {
    return getRule(rule)
}

export function isRule(rule: unknown): rule is All {
    if (!array()(rule)) return false

    const [r, args, handler] = rule

    if (!string()(r)) return false
    if (!array()(args)) return false

    if (!!handler && !isFunction(handler)) return false

    return true
}

export function isDefaultRule(rule: unknown): rule is Default {
    if (!isRule(rule)) return false
    if (!(rule[0] in bindings)) return false

    return true
}

export const isCustomHandler = <Args extends any[] = unknown[], Subject = unknown>(
    handler: unknown
): handler is CustomHandler<Args, Subject> =>
    typeof handler === 'function' &&
    typeof handler(void 0) === 'function' &&
    typeof handler(void 0)() === 'boolean'

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

export const setRule = (rule: Rule) => {
    const setErrorMessageFormator = (messageFormator: (...args: any[]) => string) =>
        setMessageFormator(messageFormator, rule)

    const setErrorMessage = (message: string) => setErrorMessageFormator(() => message)

    return Object.freeze({ setErrorMessageFormator, setErrorMessage })
}

export const createSetRule = (_arg: unknown) => {
    const setRule = (rule: Rule) => {
        const setErrorMessageFormator = (messageFormator: (...args: any[]) => string) =>
            setMessageFormator(messageFormator, rule)

        const setErrorMessage = (message: string) => setErrorMessageFormator(() => message)

        return Object.freeze({ setErrorMessageFormator, setErrorMessage })
    }

    return setRule
}

export const createRule = <
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
    Parameters<Handler>[0]
> => {
    type Args = Parameters<ReturnType<Handler>>
    type Subject = Parameters<Handler>[0]

    // const rule: Custom<Args, RName> = [name, [], handler]

    const wrapper = (subject: Subject) => {
        const setRule = createSetRule(handler)

        // return setRule(handler(subject))
        if (!!messageFormator)
            return setRule(handler(subject)).setErrorMessageFormator(messageFormator)
        if (!!message) return setRule(handler(subject)).setErrorMessage(message)

        return handler(subject)
    }

    return (...args: Args) => [name, args, wrapper]
    // if (!!message) rule[2] = setRule(handler).setErrorMessage(message)
    // if (!!messageFormator) rule[2] = setRule(handler).setErrorMessageFormator(messageFormator)
    // return () => [name, [], setRule(handler).setErrorMessage(message)]
    // return () => [name, [], setRule(handler).setErrorMessage(message)]
}

// function consoleInline<T>(arg: T): typeof arg
// function consoleInline<T>(...args: T[]): typeof args

// function consoleInline<T>(arg0: T, ...args: T[]) {
//     console.log(arg0, ...args)
//     return args.length ? [arg0, ...args] : arg0
// }

export const getCustomRuleMessages = (rules: Custom[]) =>
    rules.map(([, args, handler]) => `${getMessageFormator(handler(void 0))(...args)}`)

export function useCustomRules<T, U extends Custom<any[], string, any>>(
    guard: TypeGuard<T>,
    rule: U
): typeof guard
export function useCustomRules<
    T,
    U1 extends Custom<any[], string, any>,
    U2 extends Custom<any[], string, any>
>(guard: TypeGuard<T>, rule: U1, rule2: U2): typeof guard
export function useCustomRules<
    T,
    U1 extends Custom<any[], string, any>,
    U2 extends Custom<any[], string, any>,
    U3 extends Custom<any[], string, any>
>(guard: TypeGuard<T>, rule: U1, rule2: U2, rule3: U3): typeof guard
export function useCustomRules<
    T,
    U1 extends Custom<any[], string, any>,
    U2 extends Custom<any[], string, any>,
    U3 extends Custom<any[], string, any>,
    U4 extends Custom<any[], string, any>
>(guard: TypeGuard<T>, rule: U1, rule2: U2, rule3: U3, rule4: U4): typeof guard
export function useCustomRules<
    T,
    U1 extends Custom<any[], string, any>,
    U2 extends Custom<any[], string, any>,
    U3 extends Custom<any[], string, any>,
    U4 extends Custom<any[], string, any>,
    U5 extends Custom<any[], string, any>
>(guard: TypeGuard<T>, rule: U1, rule2: U2, rule3: U3, rule4: U4, rule5: U5): typeof guard
export function useCustomRules<
    T,
    U1 extends Custom<any[], string, any>,
    U2 extends Custom<any[], string, any>,
    U3 extends Custom<any[], string, any>,
    U4 extends Custom<any[], string, any>,
    U5 extends Custom<any[], string, any>,
    U extends Custom<any[], string, any>
>(
    guard: TypeGuard<T>,
    rule1: U1,
    rule2: U2,
    rule3: U3,
    rule4: U4,
    rule5: U5,
    ...rules: U[]
): typeof guard
export function useCustomRules<T, U extends Custom<any[], string, any>>(
    guard: TypeGuard<T>,
    ...rules: U[]
): typeof guard

export function useCustomRules<T, U extends Custom<any[], string, any>>(
    guard: TypeGuard<T>,
    ...rules: U[]
): typeof guard {
    if (!isTypeGuard(guard)) throw new Error(`\`guard\` is not a predicate`)

    const wrapper = ((subject: unknown) =>
        guard(subject) && isFollowingRules(subject, rules)) as typeof guard

    Object.defineProperty(wrapper, 'name', { value: `useCustomRules::${guard.name}` })

    const metadata = getStructMetadata(guard)
    const message = getMessage(guard)
    const prepend = message.trim().length > 0 ? `${message} & ` : ''

    return setRuleMessage(
        `${prepend}${getCustomRuleMessages(rules).join(' & ')}`,
        setStructMetadata<T | any>({ ...metadata, schema: wrapper }, wrapper)
    ) as typeof guard
}

// type a = TypeGuard<> extends TypeGuard<string> ? 'yes' : 'no'
