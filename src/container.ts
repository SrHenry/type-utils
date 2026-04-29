import type { Container } from './di/index.ts'

let _root: Container | null = null

export function getContainer(): Container {
  if (!_root) {
    throw new Error(
      'Container not initialized. Call bootstrap() first, or import the library entry point.'
    )
  }
  return _root
}

export function setContainer(container: Container): void {
  _root = container
}

export function resetContainer(): void {
  _root = null
}

export type ServiceResolver<T extends Record<string, any>> = T & { _invalidate(): void }

export function createServiceResolver<T extends Record<string, any>>(
  factory: (container: Container) => T
): ServiceResolver<T> {
  let cached: T | null = null
  let version = -1

  function resolve(): T {
    const container = getContainer()
    if (!cached || version !== container.version) {
      cached = factory(container)
      version = container.version
    }
    return cached
  }

  const handler: ProxyHandler<object> = {
    get(_, prop: string | symbol) {
      if (prop === '_invalidate') return () => { cached = null; version = -1 }
      if (!_root) {
        return (...args: unknown[]) => {
          const service = resolve()
          const fn = (service as any)[prop]
          if (typeof fn === 'function') return fn(...args)
          return fn
        }
      }
      return (resolve() as any)[prop]
    },
  }

  return new Proxy({} as object, handler) as ServiceResolver<T>
}
