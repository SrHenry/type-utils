import { getStructMetadata } from './helpers/getStructMetadata'
import { setStructMetadata } from './helpers/setStructMetadata'

export type * from './types'

export { and } from './and'
export { any } from './any'
export { array } from './array'
export { asEnum } from './asEnum'
export { asNull } from './asNull'
export { asUndefined } from './asUndefined'
export { bigint } from './bigint'
export { boolean } from './boolean'
export { optionalize, optionalizeOverloadFactory } from './helpers/optional'
export type { TypeGuardFactory } from './helpers/optional/types'
export { hasOptionalFlag } from './helpers/optionalFlag'
export { number } from './number'
export { object } from './object'
export { or } from './or'
export { primitive } from './primitive'
export { record } from './record'
export { string } from './string'
export { symbol } from './symbol'
export { useSchema } from './useSchema'
export { getStructMetadata, setStructMetadata }

import { and } from './and'
import { any } from './any'
import { array } from './array'
import { asEnum } from './asEnum'
import { asNull } from './asNull'
import { asUndefined } from './asUndefined'
import { bigint } from './bigint'
import { boolean } from './boolean'
import { optionalize, optionalizeOverloadFactory } from './helpers/optional'
import { number } from './number'
import { object } from './object'
import { or } from './or'
import { primitive } from './primitive'
import { record } from './record'
import { string } from './string'
import { symbol } from './symbol'
import { useSchema } from './useSchema'

export const Schema = {
    and,
    any,
    array,
    asEnum,
    asNull,
    asUndefined,
    boolean,
    number,
    bigint,
    object,
    record,
    or,
    primitive,
    string,
    symbol,
    useSchema,
    optionalize,
    optionalizeOverloadFactory,
    getStructMetadata,
    setStructMetadata,
}
