import type { Fn } from '../../../types/Func.ts'
import type { CustomHandler } from '../types/index.ts'

export function createRuleHandler<TSubject, TArgs extends [...any[]]>(
    predicate: Fn<[subject: TSubject, ...TArgs], boolean>
): CustomHandler<TArgs, TSubject> {
    return (subject: TSubject) =>
        (...args: TArgs) =>
            predicate(subject, ...args)
}
