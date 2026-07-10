const handler = (arg: Record<keyof any, unknown>, allowedKeys: string[]): boolean =>
    arg === null ||
    typeof arg !== 'object' ||
    (Object.keys(arg) as string[]).every(k => allowedKeys.includes(k))

export { handler as strict }
