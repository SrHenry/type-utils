export function parsePathString(path: string | undefined): PropertyKey[] | undefined {
  if (path === undefined || path === '$' || path === '') return undefined

  let rest = path.startsWith('$') ? path.slice(1) : path

  const keys: PropertyKey[] = []

  while (rest.length > 0) {
    if (rest.startsWith('.')) {
      rest = rest.slice(1)
    }

    const indexMatch = /^\[(\d+)\]/.exec(rest)
    if (indexMatch) {
      keys.push(Number(indexMatch[1]))
      rest = rest.slice(indexMatch[0].length)
      continue
    }

    const dotOrBracket = /[.\[]/.exec(rest)
    if (dotOrBracket) {
      keys.push(rest.slice(0, dotOrBracket.index))
      rest = rest.slice(dotOrBracket.index)
    } else {
      keys.push(rest)
      rest = ''
    }
  }

  return keys.length > 0 ? keys : undefined
}

export function buildPathString(keys: readonly PropertyKey[]): string {
  let result = '$'

  for (const key of keys) {
    if (typeof key === 'number') {
      result += `[${key}]`
    } else {
      result += `.${String(key)}`
    }
  }

  return result
}
