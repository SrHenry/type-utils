export function createDefaultGenerator<T>(): Generator<T>
export function createDefaultGenerator<T>(from: Iterator<T>): Generator<T>

export function* createDefaultGenerator<T>(from: Iterator<T> = [].values()): Generator<T> {
    while (true) {
        const { done, value: error } = from.next()

        if (done) return

        yield error
    }
}
