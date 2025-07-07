import { setMessageFormator } from '../../TypeGuards/helpers/setMessageFormator'

// <NumberRules> import section:
import { maxFormator } from './Number/formators/max'
import { minFormator } from './Number/formators/min'
import { nonZeroFormator } from './Number/formators/nonZero'

import { max as numberMaxHandler } from './Number/handlers/max'
import { min as numberMinHandler } from './Number/handlers/min'
import { nonZero } from './Number/handlers/nonZero'

// <ArrayRules> import section:
import { arrayMaxFormator } from './Array/formators/max'
import { arrayMinFormator } from './Array/formators/min'
import { uniqueFormator as arrayUniqueFormator } from './Array/formators/unique'

import { max as arrayMaxHandler } from './Array/handlers/max'
import { min as arrayMinHandler } from './Array/handlers/min'
import { unique as uniqueHandler } from './Array/handlers/unique'

// <NumberRules> import section:
import { emailFormator as stringEmailFormator } from './String/formators/email'
import { stringMaxFormator } from './String/formators/max'
import { stringMinFormator } from './String/formators/min'
import { nonEmptyFormator as stringNonEmptyFormator } from './String/formators/nonEmpty'
import { regexFormator as stringRegexFormator } from './String/formators/regex'
import { urlFormator as stringUrlFormator } from './String/formators/url'

import { email as stringEmailHandler } from './String/handlers/email'
import { max as stringMaxHandler } from './String/handlers/max'
import { min as stringMinHandler } from './String/handlers/min'
import { nonEmpty as stringNonEmptyHandler } from './String/handlers/nonEmpty'
import { regex as stringRegexHandler } from './String/handlers/regex'
import { url as stringUrlHandler } from './String/handlers/url'

// <RecordRules> import section:
import { nonEmptyFormator as recordNonEmptyFormator } from './Record/formators/nonEmpty'

import { nonEmpty as recordNonEmptyHandler } from './Record/handlers/nonEmpty'

// <OptionalRules> import section:
import { optional as optionalHandler } from './Optional/handlers/optional'

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
    'String.email': '__String.email__',
    'String.url': '__String.url__',

    'Record.nonEmpty': '__Record.nonEmpty__',

    'optional': '__optional__',
} as const
export type keys = typeof keys

export const bindings = {
    [keys['Number.nonZero']]: setMessageFormator(nonZeroFormator, nonZero),
    [keys['Number.max']]: setMessageFormator(maxFormator, numberMaxHandler),
    [keys['Number.min']]: setMessageFormator(minFormator, numberMinHandler),

    [keys['Array.max']]: setMessageFormator(arrayMaxFormator, arrayMaxHandler),
    [keys['Array.min']]: setMessageFormator(arrayMinFormator, arrayMinHandler),
    [keys['Array.unique']]: setMessageFormator(arrayUniqueFormator, uniqueHandler),

    [keys['String.max']]: setMessageFormator(stringMaxFormator, stringMaxHandler),
    [keys['String.min']]: setMessageFormator(stringMinFormator, stringMinHandler),
    [keys['String.regex']]: setMessageFormator(stringRegexFormator, stringRegexHandler),
    [keys['String.nonEmpty']]: setMessageFormator(stringNonEmptyFormator, stringNonEmptyHandler),
    [keys['String.email']]: setMessageFormator(stringEmailFormator, stringEmailHandler),
    [keys['String.url']]: setMessageFormator(stringUrlFormator, stringUrlHandler),

    [keys['Record.nonEmpty']]: setMessageFormator(recordNonEmptyFormator, recordNonEmptyHandler),

    [keys['optional']]: optionalHandler,
} as const
export type bindings = typeof bindings
