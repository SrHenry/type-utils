/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // verbose: true,
    roots: ['<rootDir>/src'],
    // TODO: remove `/src/test` from below when actually they be tests or remove 'em completely
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/src/test',
        // /^(?:(?!\.(spec|test)\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)).)*$/.source,
    ],
}
