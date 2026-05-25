import { setMessageFormator } from '../../../TypeGuards/helpers/setMessageFormator.ts'
import type { Rule } from '../types/index.ts'

export const setRule = (
    rule: Rule
): {
    readonly setErrorMessageFormator: (messageFormator: (...args: any[]) => string) => Rule
    readonly setErrorMessage: (message: string) => Rule
} => {
    const setErrorMessageFormator = (messageFormator: (...args: any[]) => string): Rule =>
        setMessageFormator(messageFormator, rule)

    const setErrorMessage = (message: string): Rule => setErrorMessageFormator(() => message)

    return Object.freeze({ setErrorMessageFormator, setErrorMessage })
}
