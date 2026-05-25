// biome-ignore lint/nursery/noUselessTypeConversion: String() guards against undefined at runtime
const handler = (arg: string, regex: RegExp): boolean => regex.test(String(arg))

export { handler as regex }
