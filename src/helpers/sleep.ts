export const sleep = (milliseconds: number, onfulfilled?: () => any) => {
    return new Promise<void>(resolve => setTimeout(() => resolve(), milliseconds)).then(onfulfilled)
}
