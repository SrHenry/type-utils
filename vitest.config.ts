import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/**/*.spec.ts'],
		exclude: ['**/node_modules/**', '**/dist/**', 'src/test/**'],
		setupFiles: ['./src/vitest.setup.ts'],
		globals: true,
		pool: 'threads',
		poolOptions: {
			threads: {
				maxThreads: '50%',
			},
		},
	},
	resolve: {
		alias: [
			{
				find: /^(\.\.\/.*)\.js$/,
				replacement: '$1',
			},
			{
				find: /^(\.\/.*)\.js$/,
				replacement: '$1',
			},
		],
	},
})
