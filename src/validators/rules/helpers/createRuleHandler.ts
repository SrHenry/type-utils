import type { Fn } from '../../../types/Func'
import type { CustomHandler } from '../types'

export function createRuleHandler<TSubject, TArgs extends [...any[]]>(
    predicate: Fn<[subject: TSubject, ...TArgs], boolean>
): CustomHandler<TArgs, TSubject> {
    return (subject: TSubject) =>
        (...args: TArgs) =>
            predicate(subject, ...args)
}
