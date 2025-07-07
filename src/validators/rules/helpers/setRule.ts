import { setMessageFormator } from '../../../TypeGuards/helpers/setMessageFormator'
import { Rule } from '../types'

export const setRule = (rule: Rule) => {
    const setErrorMessageFormator = (messageFormator: (...args: any[]) => string) =>
        setMessageFormator(messageFormator, rule)

    const setErrorMessage = (message: string) => setErrorMessageFormator(() => message)

    return Object.freeze({ setErrorMessageFormator, setErrorMessage })
}
