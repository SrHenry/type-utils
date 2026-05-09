export function inject<T>(value: Exclude<T, Promise<any>>): (_incoming: unknown) => Exclude<T, Promise<any>>
export function inject<T>(value: Promise<T>): (_incoming: unknown) => Promise<T>
export function inject<T>(value: T | Promise<T>): (_incoming: unknown) => T | Promise<T> {
  return () => value
}
