const handler = (arg: string, regex: RegExp) => regex.test(arg)

export { handler as regex }
