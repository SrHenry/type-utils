export function unwrap<T>(value: T): T {
  if (value !== null && value !== undefined && typeof value === 'object') {
    const ctor = (value as object).constructor
    if (
      ctor === String ||
      ctor === Number ||
      ctor === Boolean ||
      ctor === Symbol ||
      ctor === BigInt
    ) {
      return (value as { valueOf(): T }).valueOf()
    }
  }
  return value
}
