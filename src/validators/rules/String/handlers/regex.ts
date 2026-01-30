const handler = (arg: string, regex: RegExp) => regex.test(String(arg))

export { handler as regex }
