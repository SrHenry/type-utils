export function createDefaultGenerator<T>(from?: Iterator<T>): Generator<T>

export function* createDefaultGenerator<T>(from: Iterator<T> = [].values()): Generator<T> {
    // biome-ignore lint/nursery/noUnnecessaryConditions: infinite generator loop pattern
    while (true) {
        const { done, value: error } = from.next()

        if (done) return

        yield error
    }
}
