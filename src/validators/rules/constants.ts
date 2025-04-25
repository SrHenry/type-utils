import { setMessageFormator } from '../../TypeGuards/GenericTypeGuards'
import {
    arrayMaxFormator,
    arrayMinFormator,
    max,
    maxFormator,
    min,
    minFormator,
    nonEmptyFormator,
    nonZero,
    nonZeroFormator,
    regexFormator,
    stringMaxFormator,
    stringMinFormator,
    unique,
    uniqueFormator,
} from './common'
import { getRule } from './helpers'

export const keys = {
    'Number.nonZero': '__Number.nonZero__',
    'Number.max': '__Number.max__',
    'Number.min': '__Number.min__',

    'Array.max': '__Array.max__',
    'Array.min': '__Array.min__',
    'Array.unique': '__Array.unique__',

    'String.max': '__String.max__',
    'String.min': '__String.min__',
    'String.regex': '__String.regex__',
    'String.nonEmpty': '__String.nonEmpty__',

    'Record.nonEmpty': '__Record.nonEmpty__',

    'optional': '__optional__',
} as const
export type keys = typeof keys

export const bindings = {
    [keys['Number.nonZero']]: setMessageFormator(nonZeroFormator, nonZero),
    [keys['Number.max']]: setMessageFormator(maxFormator, max),
    [keys['Number.min']]: setMessageFormator(minFormator, min),

    [keys['Array.max']]: setMessageFormator(arrayMaxFormator, (arg: unknown[], n: number) =>
        max(arg.length, n)
    ),
    [keys['Array.min']]: setMessageFormator(arrayMinFormator, (arg: unknown[], n: number) =>
        min(arg.length, n)
    ),
    [keys['Array.unique']]: setMessageFormator(uniqueFormator, unique),

    [keys['String.max']]: setMessageFormator(stringMaxFormator, (arg: string, n: number) =>
        max(arg.length, n)
    ),
    [keys['String.min']]: setMessageFormator(stringMinFormator, (arg: string, n: number) =>
        min(arg.length, n)
    ),
    [keys['String.regex']]: setMessageFormator(regexFormator, (arg: string, regex: RegExp) =>
        regex.test(arg)
    ),
    [keys['String.nonEmpty']]: setMessageFormator(nonEmptyFormator, (arg: string) =>
        getRule('Number.nonZero')?.(arg.length)
    ),

    [keys['Record.nonEmpty']]: setMessageFormator(
        nonEmptyFormator,
        (arg: Record<keyof any, unknown>) => getRule('Number.nonZero')?.(Object.keys(arg).length)
    ),

    [keys.optional]: (arg: unknown) => arg === void 0,
} as const
export type bindings = typeof bindings
