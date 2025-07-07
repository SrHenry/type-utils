const handler = (arg: string) => {
    try {
        new URL(arg)
        return true
    } catch (e) {
        return false
    }
}

export { handler as url }
