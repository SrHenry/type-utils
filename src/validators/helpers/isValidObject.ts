export const isValidObject = (arg: unknown): arg is Record<string, any> =>
    !!arg && typeof arg === 'object'
