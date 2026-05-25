declare module 'vitest' {
    interface Assertion<T = any> {
        toMatchStructure(expected: any): T
    }
}
