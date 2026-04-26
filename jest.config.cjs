/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testPathIgnorePatterns: [
		'/node_modules/',
		'/dist/',
		'/src/test',
	],
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: 'tsconfig.test.json',
			},
		],
	},
	transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
	setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
}
