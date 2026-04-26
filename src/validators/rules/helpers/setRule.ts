import { setMessageFormator } from '../../../TypeGuards/helpers/setMessageFormator.ts'
import { Rule } from '../types/index.ts'

export const setRule = (rule: Rule) => {
    const setErrorMessageFormator = (messageFormator: (...args: any[]) => string) =>
        setMessageFormator(messageFormator, rule)

    const setErrorMessage = (message: string) => setErrorMessageFormator(() => message)

    return Object.freeze({ setErrorMessageFormator, setErrorMessage })
}
