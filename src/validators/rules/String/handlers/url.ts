const handler = (arg: string) => {
    try {
        new URL(arg)
        return true
    } catch (_e) {
        return false
    }
}

export { handler as url }
