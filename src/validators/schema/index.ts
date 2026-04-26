import { getStructMetadata } from './helpers/getStructMetadata.ts'
import { setStructMetadata } from './helpers/setStructMetadata.ts'

export type * from './types/index.ts'

export { and } from './and.ts'
export { any } from './any.ts'
export { array } from './array.ts'
export { asEnum } from './asEnum.ts'
export { asNull } from './asNull.ts'
export { asUndefined } from './asUndefined.ts'
export { bigint } from './bigint.ts'
export { boolean } from './boolean.ts'
export { optionalize, optionalizeOverloadFactory } from './helpers/optional/index.ts'
export type { TypeGuardFactory } from './helpers/optional/types.ts'
export { hasOptionalFlag } from './helpers/optionalFlag.ts'
export { number } from './number.ts'
export { object } from './object.ts'
export { or } from './or.ts'
export { primitive } from './primitive.ts'
export { record } from './record.ts'
export { string } from './string.ts'
export { symbol } from './symbol.ts'
export { tuple } from './tuple.ts'
export { useSchema } from './useSchema.ts'
export { getStructMetadata, setStructMetadata }

import { and } from './and.ts'
import { any } from './any.ts'
import { array } from './array.ts'
import { asEnum } from './asEnum.ts'
import { asNull } from './asNull.ts'
import { asUndefined } from './asUndefined.ts'
import { bigint } from './bigint.ts'
import { boolean } from './boolean.ts'
import { optionalize, optionalizeOverloadFactory } from './helpers/optional/index.ts'
import { number } from './number.ts'
import { object } from './object.ts'
import { or } from './or.ts'
import { primitive } from './primitive.ts'
import { record } from './record.ts'
import { string } from './string.ts'
import { symbol } from './symbol.ts'
import { tuple } from './tuple.ts'
import { useSchema } from './useSchema.ts'

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
    tuple,
    useSchema,
    optionalize,
    optionalizeOverloadFactory,
    getStructMetadata,
    setStructMetadata,
}
