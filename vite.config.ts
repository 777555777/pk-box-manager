import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [
		// SvelteKit 3: the former svelte.config.js options are passed to the plugin directly
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter()
		})
	],
	test: {
		include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
		environment: 'node',
		setupFiles: ['tests/setup/local-storage.ts'],
		restoreMocks: true
	}
})
