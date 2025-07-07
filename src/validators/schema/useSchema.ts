import type { TypeGuard } from '../../TypeGuards/types'

import { optionalize } from './helpers/optional'

function _fn<T>(schema: TypeGuard<T>): TypeGuard<T> {
    return schema
}

export const useSchema = optionalize(_fn)
