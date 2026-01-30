export const parseListToString = <U>(list: U[]) =>
    list
        .map(String)
        .join(', ')
        .replace(/^(.*), (\d+)$/g, '$1 and $2')
