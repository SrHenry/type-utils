export function asPipelinePromise<T>(value: T | Promise<T>): Promise<unknown> {
  return value as unknown as Promise<unknown>
}
