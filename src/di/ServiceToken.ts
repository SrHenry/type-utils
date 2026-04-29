import type { ServiceToken } from './types.ts'

let counter = 0

export function createToken<T>(name: string): ServiceToken<T> {
  const id = ++counter
  return {
    __service: Symbol(`di:service:${name}:${id}`) as unknown as ServiceToken<T>['__service'],
    __type: null as unknown as T,
    name: `${name}:${id}`,
  } as ServiceToken<T>
}
