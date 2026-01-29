import { isCustom } from '../../rules/helpers/isCustomRule'

export function findInvalidCustomRulesIndexes(list: unknown[]) {
    return list.reduce<number[]>((idxs, r, i) => {
        if (!isCustom(r)) idxs.push(i)

        return idxs
    }, [])
}
